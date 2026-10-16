import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {newTodoValidator, pageValidator, storedTodoValidator, todoIdValidator} from '@/schemas';

const text = (length: number): string => 'a'.repeat(length);

describe('newTodoValidator', () => {
    const validTodo = {title: text(10), description: text(10)};

    it('accepts a valid todo', () => {
        assert.deepEqual(newTodoValidator.validate(validTodo), {valid: true, data: validTodo});
    });

    it('title length boundaries are 10..120', () => {
        assert.equal(newTodoValidator.validate({...validTodo, title: text(9)}).valid, false);
        assert.equal(newTodoValidator.validate({...validTodo, title: text(10)}).valid, true);
        assert.equal(newTodoValidator.validate({...validTodo, title: text(120)}).valid, true);
        assert.equal(newTodoValidator.validate({...validTodo, title: text(121)}).valid, false);
    });

    it('description length boundaries are 10..255', () => {
        assert.equal(newTodoValidator.validate({...validTodo, description: text(9)}).valid, false);
        assert.equal(newTodoValidator.validate({...validTodo, description: text(255)}).valid, true);
        assert.equal(newTodoValidator.validate({...validTodo, description: text(256)}).valid, false);
    });

    it('puts the "required" message first for an empty title (the controller shows only [0])', () => {
        const result = newTodoValidator.validate({...validTodo, title: ''});
        assert.equal(result.valid, false);
        if (!result.valid) assert.equal(result.innerErrors.title?.[0], 'Title is required');
    });

    it('reports a missing field with its type message', () => {
        const result = newTodoValidator.validate({title: validTodo.title});
        assert.equal(result.valid, false);
        if (!result.valid) assert.deepEqual(result.innerErrors, {description: ['Description must be a string']});
    });

    it('strips unknown fields coming from the form', () => {
        const result = newTodoValidator.validate({...validTodo, id: 'injected', createdAt: 'x'});
        assert.deepEqual(result, {valid: true, data: validTodo});
    });

    it('counts cyrillic characters, not bytes', () => {
        assert.equal(newTodoValidator.validate({...validTodo, title: 'я'.repeat(120)}).valid, true);
    });
});

describe('todoIdValidator', () => {
    it('accepts a random UUID', () => {
        assert.equal(todoIdValidator.validate(crypto.randomUUID()).valid, true);
    });

    it('reports both messages for an empty string', () => {
        assert.deepEqual(todoIdValidator.validate(''), {
            valid: false,
            errors: ['ID is required', 'ID must be a valid UUID']
        });
    });

    it('rejects path-like ids', () => {
        assert.equal(todoIdValidator.validate('../todos').valid, false);
    });
});

describe('storedTodoValidator', () => {
    const storedTodo = {id: crypto.randomUUID(), title: 'x', description: '', createdAt: new Date().toISOString()};

    it('checks only the shape, not the form rules', () => {
        assert.equal(storedTodoValidator.validate(storedTodo).valid, true);
    });

    it('rejects a broken id or a missing field', () => {
        assert.equal(storedTodoValidator.validate({...storedTodo, id: '1'}).valid, false);
        const {createdAt: _, ...withoutDate} = storedTodo;
        assert.equal(storedTodoValidator.validate(withoutDate).valid, false);
    });
});

describe('pageValidator (fed with Number(search.get("page")))', () => {
    const cases: [string | null, boolean][] = [
        [null, false],
        ['', false],
        ['0', false],
        ['-1', false],
        ['1.5', false],
        ['abc', false],
        ['Infinity', false],
        ['1', true],
        [' 2 ', true],
        ['1e3', true]
    ];

    for (const [raw, isValid] of cases) {
        it(`${JSON.stringify(raw)} → ${isValid ? 'valid' : 'invalid'}`, () => {
            assert.equal(pageValidator.validate(Number(raw)).valid, isValid);
        });
    }
});
