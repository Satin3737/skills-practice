import {beforeEach, describe, expect, it} from 'vitest';
import Counter from '@/scripts/Counter';
import {CommandsRunner, DecrementCommand, IncrementCommand, ResetCommand, SetCommand} from './';

describe('Counter', () => {
    it('starts at 0 and supports increment, decrement, reset and direct set', () => {
        const counter = new Counter();
        expect(counter.count).toBe(0);
        counter.increment();
        counter.increment();
        counter.decrement();
        expect(counter.count).toBe(1);
        counter.count = 42;
        expect(counter.count).toBe(42);
        counter.reset();
        expect(counter.count).toBe(0);
    });
});

describe('commands', () => {
    let counter: Counter;

    beforeEach(() => {
        counter = new Counter();
        counter.count = 5;
    });

    it.each([
        ['IncrementCommand', (c: Counter) => new IncrementCommand(c), 6],
        ['DecrementCommand', (c: Counter) => new DecrementCommand(c), 4],
        ['ResetCommand', (c: Counter) => new ResetCommand(c), 0],
        ['SetCommand', (c: Counter) => new SetCommand(c, -3), -3]
    ])('%s exec applies and undo restores the saved backup', (_, create, expected) => {
        const command = create(counter);
        command.saveBackup();
        command.exec();
        expect(counter.count).toBe(expected);
        command.undo();
        expect(counter.count).toBe(5);
    });

    it('undo without saveBackup falls back to 0', () => {
        const command = new IncrementCommand(counter);
        command.exec();
        command.undo();
        expect(counter.count).toBe(0);
    });
});

describe('CommandsRunner', () => {
    let counter: Counter;
    let runner: CommandsRunner;

    beforeEach(() => {
        counter = new Counter();
        runner = new CommandsRunner();
    });

    it('has nothing to undo or redo initially, and no-ops safely', () => {
        expect(runner.canUndo).toBe(false);
        expect(runner.canRedo).toBe(false);
        runner.undo();
        runner.redo();
        expect(counter.count).toBe(0);
    });

    it('runCommand executes and makes undo available', () => {
        runner.runCommand(new IncrementCommand(counter));
        expect(counter.count).toBe(1);
        expect(runner.canUndo).toBe(true);
        expect(runner.canRedo).toBe(false);
    });

    it('undoes and redoes a sequence in order', () => {
        runner.runCommand(new IncrementCommand(counter));
        runner.runCommand(new IncrementCommand(counter));
        runner.runCommand(new SetCommand(counter, 10));

        runner.undo();
        expect(counter.count).toBe(2);
        runner.undo();
        expect(counter.count).toBe(1);
        expect(runner.canRedo).toBe(true);

        runner.redo();
        expect(counter.count).toBe(2);
        runner.redo();
        expect(counter.count).toBe(10);
        expect(runner.canRedo).toBe(false);
    });

    it('running a new command clears the redo history', () => {
        runner.runCommand(new IncrementCommand(counter));
        runner.undo();
        expect(runner.canRedo).toBe(true);

        runner.runCommand(new DecrementCommand(counter));
        expect(runner.canRedo).toBe(false);
        expect(counter.count).toBe(-1);
    });

    it('undo of a reset restores the previous value', () => {
        counter.count = 7;
        runner.runCommand(new ResetCommand(counter));
        expect(counter.count).toBe(0);
        runner.undo();
        expect(counter.count).toBe(7);
    });
});
