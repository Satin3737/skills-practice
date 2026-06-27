import {randomBytes, scrypt} from 'crypto';
import {timingSafeEqual} from 'node:crypto';
import {promisify} from 'util';

const scryptAsync = promisify(scrypt);
const keyLen = 64;

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scryptAsync(password, salt, keyLen)) as Buffer;
    return `${salt}:${derived.toString('hex')}`;
};

export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
    const [salt, hashHex] = stored.split(':');
    const hash = Buffer.from(hashHex, 'hex');
    const derived = (await scryptAsync(password, salt, keyLen)) as Buffer;
    return hash.length === derived.length && timingSafeEqual(hash, derived);
};
