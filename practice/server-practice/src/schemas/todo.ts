import type {INewTodo} from '@/features/todos';
import {ObjectValidator, StringValidator} from '@/validator';

export const newTodoValidator = new ObjectValidator<INewTodo>({
    title: new StringValidator('Title must be a string')
        .notEmpty('Title is required')
        .min(10, 'Title must be at least 10 characters')
        .max(120, 'Title must be no longer than 120 characters'),
    description: new StringValidator('Description must be a string')
        .notEmpty('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(255, 'Description must be no longer than 255 characters')
});

export const todoIdValidator = new StringValidator('ID must be a string')
    .notEmpty('ID is required')
    .uuid('ID must be a valid UUID');
