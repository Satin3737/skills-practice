import {z} from 'zod';
import {byIdPSchema} from '@/common/schemas';
import {StormtrooperPlain, UserPlain} from '@/database/models';
import {UserRank} from '@/database/prisma/enums';
import {createStormtrooperSchema} from '@/modules/stormtroopers/schemas';

const UserPlainPublic = UserPlain.omit({password: true});

const passwordSchema = z.string().min(6).max(255);

export const registerUserSchema = {
    security: [],
    body: z
        .object({
            email: z.string().regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/),
            password: passwordSchema,
            rank: z.enum(UserRank).optional(),
            ...createStormtrooperSchema.body.shape
        })
        .strict(),
    response: {
        201: z.object({user: UserPlainPublic})
    }
};

export const loginUserSchema = {
    security: [],
    body: registerUserSchema.body.pick({email: true, password: true}),
    response: {
        200: z.object({
            token: z.string()
        }),
        401: z.object({
            message: z.string()
        })
    }
};

export const oauthCallbackSchema = {
    security: [],
    response: {
        200: z.object({
            token: z.string()
        })
    }
};

export const refreshTokenSchema = {
    security: [],
    response: {
        200: z.object({
            token: z.string()
        })
    }
};

export const logoutUserSchema = {
    security: [],
    response: {
        200: z.object({
            message: z.string()
        })
    }
};

export const getCurrentUserSchema = {
    response: {
        200: z.object({
            user: UserPlainPublic.extend({stormtrooper: StormtrooperPlain})
        })
    }
};

export const updateUserSchema = {
    params: byIdPSchema,
    body: registerUserSchema.body.partial().refine(data => Object.keys(data).length > 0),
    response: {
        200: z.object({user: UserPlainPublic})
    }
};

export const changeUserRankSchema = {
    params: byIdPSchema,
    body: z.object({
        rank: z.enum(UserRank)
    }),
    response: {
        200: z.object({user: UserPlainPublic})
    }
};

export const changeUserPasswordSchema = {
    body: z
        .object({
            password: passwordSchema.optional(),
            newPassword: passwordSchema
        })
        .strict(),
    response: {
        200: z.object({message: z.string()})
    }
};
