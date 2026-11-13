import {randomBytes, scrypt} from 'crypto';
import type {FastifyReply} from 'fastify';
import {timingSafeEqual} from 'node:crypto';
import {promisify} from 'util';
import {Environment} from '@/common/const';
import type {Session, User} from '@/database/prisma/client';
import {RefreshCookieName, RefreshTokenAgeSec, TokenTypes, refreshCookieOptions} from './const';
import type SessionsService from './sessions/service';

const scryptAsync = promisify(scrypt);
const keyLen = 64;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(password, salt, keyLen)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
};

export const verifyPassword = async (password: string, stored: string | null): Promise<boolean> => {
    if (!stored) return false;
    const [salt, hashHex] = stored.split(':');
    const hash = Buffer.from(hashHex, 'hex');
    const derived = (await scryptAsync(password, salt, keyLen)) as Buffer;
    return hash.length === derived.length && timingSafeEqual(hash, derived);
};

export const startSession = async (
    res: FastifyReply,
    sessionsService: SessionsService,
    user: User
): Promise<string> => {
    const session = await sessionsService.createSession(user.id);
    return issueToken(res, session, user);
};

export const issueToken = async (res: FastifyReply, session: Session, user: User): Promise<string> => {
    const payload = {sub: user.id, rank: user.rank};

    const accessToken = await res.jwtSign({...payload, tokenType: TokenTypes.access});

    const refreshToken = await res.jwtSign(
        {...payload, tokenType: TokenTypes.refresh, sessionId: session.id, tokenId: session.tokenId},
        {expiresIn: RefreshTokenAgeSec}
    );

    res.setCookie(RefreshCookieName, refreshToken, {
        ...refreshCookieOptions,
        secure: res.server.config.NODE_ENV === Environment.production
    });

    return accessToken;
};
