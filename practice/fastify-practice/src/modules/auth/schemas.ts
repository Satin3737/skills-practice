import {Type} from '@fastify/type-provider-typebox';
import {byIdPSchema} from '@/common/schemas';
import {UserType} from '@/database/prisma/enums';
import {StormtrooperPlain} from '@/database/prismabox/Stormtrooper';
import {UserPlain} from '@/database/prismabox/User';
import {createStormtrooperSchema} from '@/modules/stormtroopers/schemas';

const UserPlainPublic = Type.Object(
    Object.fromEntries(Object.entries(UserPlain.properties).filter(([key]) => key !== 'password'))
);

export const registerUserSchema = {
    body: Type.Object(
        {
            email: Type.String({pattern: '^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$'}),
            password: Type.String({minLength: 6, maxLength: 255}),
            type: Type.Optional(Type.Enum(UserType)),
            ...createStormtrooperSchema.body.properties
        },
        {additionalProperties: false}
    ),
    response: {
        201: Type.Object({user: UserPlainPublic})
    }
};

export const loginUserSchema = {
    body: Type.Pick(registerUserSchema.body, ['email', 'password']),
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
    body: Type.Partial(registerUserSchema.body, {minProperties: 1}),
    response: {
        200: Type.Object({user: UserPlainPublic})
    }
};

export const changeUserRangSchema = {
    params: byIdPSchema,
    body: Type.Object({
        type: Type.Enum(UserType)
    }),
    response: {
        200: Type.Object({user: UserPlainPublic})
    }
};
