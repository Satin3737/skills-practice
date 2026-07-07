import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema} from '@/common/schemas';
import {UserRank} from '@/database/prisma/enums';
import {StormtrooperPlain} from '@/database/prismabox/Stormtrooper';
import {UserPlain} from '@/database/prismabox/User';
import {createStormtrooperSchema} from '@/modules/stormtroopers/schemas';

const UserPlainPublic = Type.Object(
    Object.fromEntries(Object.entries(UserPlain.properties).filter(([key]) => key !== 'password'))
);

const passwordSchema = Type.String({minLength: 6, maxLength: 255});

export const registerUserSchema = {
    body: Type.Object(
        {
            email: Type.String({pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'}),
            password: passwordSchema,
            rank: Type.Optional(Type.Enum(UserRank)),
            ...createStormtrooperSchema.body.properties
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({user: UserPlainPublic})
    }
};

export const loginUserSchema = {
    body: Type.Pick(registerUserSchema.body, ['email', 'password'], {additionalProperties: false}),
    response: {
        200: Type.Object({
            token: Type.String()
        }),
        401: Type.Object({
            message: Type.String()
        })
    }
};

export const refreshTokenSchema = {
    response: {
        200: Type.Object({
            token: Type.String()
        })
    }
};

export const logoutUserSchema = {
    response: {
        200: Type.Object({
            message: Type.String()
        })
    }
};

export const getCurrentUserSchema = {
    response: {
        200: Type.Object({
            user: Type.Object({...UserPlainPublic.properties, stormtrooper: StormtrooperPlain})
        })
    }
};

export const updateUserSchema = {
    params: byIdPSchema,
    body: Type.Partial(registerUserSchema.body, {minProperties: 1, additionalProperties: false}),
    response: {
        200: Type.Object({user: UserPlainPublic})
    }
};

export const changeUserRankSchema = {
    params: byIdPSchema,
    body: Type.Object({
        rank: Type.Enum(UserRank)
    }),
    response: {
        200: Type.Object({user: UserPlainPublic})
    }
};

export const changeUserPasswordSchema = {
    body: Type.Object(
        {
            password: Type.Optional(passwordSchema),
            newPassword: passwordSchema
        },
        {additionalProperties: false}
    ),
    response: {
        200: Type.Object({message: Type.String()})
    }
};
