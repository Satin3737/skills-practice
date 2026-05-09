import {z} from 'zod';

const formSchema = z.object({
    name: z
        .string('Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(120, 'Name must be no longer than 120 characters'),
    surname: z
        .string('Surname is required')
        .min(2, 'Surname must be at least 2 characters')
        .max(120, 'Surname must be no longer than 120 characters'),
    age: z.coerce
        .number('Age is required')
        .min(18, 'Age must greater than 18, you too young')
        .max(100, 'Age must be less than 100, you too old'),
    email: z.email('Email invalid'),
    color: z.enum(['red', 'green', 'yellow'], 'Color is required'),
    preferences: z.array(z.enum(['best', 'rock', 'sad'])).min(1, 'Select at least one option'),
    comment: z
        .string('Comment is required')
        .min(10, 'Comment must be at least 10 characters')
        .max(240, 'Comment must be no longer than 240 characters')
});

export default formSchema;
