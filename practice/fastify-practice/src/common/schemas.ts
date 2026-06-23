import {Type} from '@fastify/type-provider-typebox';

export const byIdPSchema = Type.Object({
    id: Type.Integer()
});

export const paginatedListSchema = Type.Object({
    page: Type.Integer({minimum: 1, default: 1}),
    limit: Type.Integer({minimum: 1, maximum: 100, default: 10}),
    search: Type.Optional(Type.String())
});
