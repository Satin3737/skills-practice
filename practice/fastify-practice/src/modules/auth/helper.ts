import {randomBytes, scrypt} from 'crypto';
import type {FastifyReply} from 'fastify';
import {timingSafeEqual} from 'node:crypto';
import {promisify} from 'util';
import type {User} from '@/database/prisma/client';
import {Environment} from '@/plugins/env';
import {RefreshTokenAgeSec, TokenTypes, refreshCookieOptions} from './const';
import type AuthService from './service';

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

export const startSession = async (res: FastifyReply, authService: AuthService, user: User): Promise<string> => {
    const session = await authService.createSession(user.id);
    const payload = {sub: user.id, rank: user.rank};

    const accessToken = await res.jwtSign({
        ...payload,
        tokenType: TokenTypes.access
    });

    const refreshToken = await res.jwtSign(
        {...payload, tokenType: TokenTypes.refresh, sessionId: session.id},
        {expiresIn: RefreshTokenAgeSec}
    );

    res.setCookie('refreshToken', refreshToken, {
        ...refreshCookieOptions,
        secure: res.server.config.NODE_ENV === Environment.production
    });

    return accessToken;
};
