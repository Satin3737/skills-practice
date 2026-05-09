import {z} from 'zod';

export const newTodoSchema = z.object({
    title: z
        .string('Title is required')
        .min(10, 'Title must be at least 10 characters')
        .max(120, 'Title must be no longer than 120 characters'),
    description: z
        .string('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(255, 'Description must be no longer than 255 characters')
});

export const deleteTodoSchema = z
    .object({
        id: z.uuid('ID is required')
    })
    .transform(data => data.id);
