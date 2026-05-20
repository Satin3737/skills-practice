import {z} from 'zod';

export const CreateUserSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.number().int().min(18, 'Age must be at least 18').max(120, 'Age must be at most 120')
});
