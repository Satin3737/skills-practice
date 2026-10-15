import NumberValidator from '../validator/number';

export const pageValidator = new NumberValidator('Page must be a number')
    .notNaN('Page must not be NaN')
    .min(1, 'Page must be at least 1');
