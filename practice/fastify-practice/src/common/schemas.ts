import {z} from 'zod';

export const byIdPSchema = z.object({
    id: z.coerce.number().int()
});

export const paginatedListSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional()
});
