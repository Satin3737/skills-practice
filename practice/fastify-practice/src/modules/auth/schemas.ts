import {Type} from '@fastify/type-provider-typebox';
import {UserType} from '@/database/prisma/enums';
import {UserPlain} from '@/database/prismabox/User';
import {createStormtrooperSchema} from '@/modules/stormtroopers/schemas';

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
        201: Type.Object({user: Type.Omit(UserPlain, ['password'])})
    }
};

export const loginUserSchema = {
    body: Type.Pick(registerUserSchema.body, ['email', 'password']),
    response: {
        200: Type.Object({
            user: Type.Omit(UserPlain, ['password']),
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
