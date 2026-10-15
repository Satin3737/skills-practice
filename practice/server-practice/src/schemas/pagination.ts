import {NumberValidator} from '@/validator';

export const pageValidator = new NumberValidator('Page must be a number')
    .integer('Page must be an integer')
    .min(1, 'Page must be at least 1');
