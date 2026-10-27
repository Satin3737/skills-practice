import assert from 'node:assert/strict';
import {afterEach, beforeEach, describe, it, mock} from 'node:test';
import {LogTypes, Logger} from './';

const colors = {info: '\x1b[34m', warn: '\x1b[33m', error: '\x1b[31m'};
const reset = '\x1b[0m';

let logSpy: ReturnType<typeof mock.method<typeof console, 'log'>>;

const lastCall = (): unknown[] => logSpy.mock.calls.at(-1)!.arguments;

const fakeElapsed = (ms: number): void => {
    let calls = 0;
    mock.method(performance, 'now', () => (calls++ === 0 ? 0 : ms));
};

const originalNoColor = process.env.NO_COLOR;

beforeEach(() => {
    logSpy = mock.method(console, 'log', () => {});
    delete process.env.NO_COLOR;
});

afterEach(() => {
    mock.restoreAll();
    Logger.configure({level: LogTypes.info, type: LogTypes.info, offset: 0, fixed: 0});
    if (originalNoColor === undefined) delete process.env.NO_COLOR;
    else process.env.NO_COLOR = originalNoColor;
});

describe('Logger.info / warn / error', () => {
    for (const type of Object.values(LogTypes)) {
        it(`${type}: prints colored tag, date and all args`, () => {
            Logger[type]('hello', 42, {a: 1});

            const [prefix, ...rest] = lastCall();
            assert.equal(typeof prefix, 'string');
            assert.ok((prefix as string).startsWith(`${colors[type]}[${type}]${reset}[`));
            assert.ok((prefix as string).endsWith(']: '));
            assert.deepEqual(rest, ['hello', 42, {a: 1}]);
        });
    }

    for (const type of Object.values(LogTypes)) {
        it(`${type}: prints no ANSI codes and keeps args when NO_COLOR is set`, () => {
            process.env.NO_COLOR = '1';

            Logger[type]('hello', 42);

            const [prefix, ...rest] = lastCall();
            assert.ok((prefix as string).startsWith(`[${type}][`));
            assert.ok(!(prefix as string).includes('\x1b'));
            assert.deepEqual(rest, ['hello', 42]);
        });
    }

    it('keeps colors when NO_COLOR is empty', () => {
        process.env.NO_COLOR = '';

        Logger.info('x');

        assert.ok((lastCall()[0] as string).startsWith(colors.info));
    });

    it('reads NO_COLOR on every call, not once at load', () => {
        Logger.info('colored');
        process.env.NO_COLOR = '1';
        Logger.info('plain');
        delete process.env.NO_COLOR;
        Logger.info('colored again');

        const prefixes = logSpy.mock.calls.map(call => call.arguments[0] as string);
        assert.deepEqual(
            prefixes.map(prefix => prefix.includes('\x1b')),
            [true, false, true]
        );
    });

    it('checkFunctionExecutionTime output has no ANSI codes when NO_COLOR is set', () => {
        process.env.NO_COLOR = '1';
        fakeElapsed(20);

        Logger.checkFunctionExecutionTime(() => {}, {type: LogTypes.error})();

        const [prefix, msg] = lastCall();
        assert.ok((prefix as string).startsWith('[error]['));
        assert.ok(!(prefix as string).includes('\x1b'));
        assert.equal(msg, 'anonymousFunc execution takes 20ms');
    });

    it('uses the current date', () => {
        mock.timers.enable({apis: ['Date'], now: new Date('2024-05-06T07:08:09Z')});

        Logger.info('x');

        assert.ok((lastCall()[0] as string).includes(new Date().toLocaleString()));
        mock.timers.reset();
    });
});

describe('Logger.checkFunctionExecutionTime', () => {
    it('returns the wrapped function result and passes args through', () => {
        fakeElapsed(0);
        const wrapped = Logger.checkFunctionExecutionTime((a: number, b: number) => a + b);

        assert.equal(wrapped(2, 3), 5);
    });

    it('logs as info by default with function name and 0 decimals', () => {
        fakeElapsed(12.6);
        function slow(): void {}

        Logger.checkFunctionExecutionTime(slow)();

        const [prefix, msg] = lastCall();
        assert.ok((prefix as string).includes('[info]'));
        assert.equal(msg, 'slow execution takes 13ms');
    });

    it('respects type and fixed options', () => {
        fakeElapsed(12.3456);
        function slow(): void {}

        Logger.checkFunctionExecutionTime(slow, {type: LogTypes.error, fixed: 2})();

        const [prefix, msg] = lastCall();
        assert.ok((prefix as string).includes('[error]'));
        assert.equal(msg, 'slow execution takes 12.35ms');
    });

    it('does not log when execution time is below offset', () => {
        fakeElapsed(5);

        Logger.checkFunctionExecutionTime(() => {}, {offset: 10})();

        assert.equal(logSpy.mock.callCount(), 0);
    });

    it('does not log when execution time equals offset', () => {
        fakeElapsed(10);

        Logger.checkFunctionExecutionTime(() => {}, {offset: 10})();

        assert.equal(logSpy.mock.callCount(), 0);
    });

    it('logs when execution time is above offset', () => {
        fakeElapsed(11);

        Logger.checkFunctionExecutionTime(() => {}, {offset: 10})();

        assert.equal(logSpy.mock.callCount(), 1);
    });

    it('keeps `this` when the function is bound', () => {
        fakeElapsed(0);
        const obj = {
            value: 7,
            get() {
                return this.value;
            }
        };

        assert.equal(Logger.checkFunctionExecutionTime(obj.get.bind(obj))(), 7);
    });

    it('waits for async functions and returns a promise with the result', async () => {
        fakeElapsed(20);
        async function load(): Promise<string> {
            return 'done';
        }

        const promise = Logger.checkFunctionExecutionTime(load)();

        assert.ok(promise instanceof Promise);
        assert.equal(await promise, 'done');
        assert.equal(lastCall()[1], 'load execution takes 20ms');
    });

    it('logs and propagates the error for a rejected async function', async () => {
        fakeElapsed(20);
        const fail = async (): Promise<void> => {
            throw new Error('boom');
        };

        await assert.rejects(Logger.checkFunctionExecutionTime(fail)(), {message: 'boom'});
        assert.equal(lastCall()[1], 'fail execution takes 20ms');
    });

    it('logs and propagates the error for a throwing sync function', () => {
        fakeElapsed(20);
        const fail = (): void => {
            throw new Error('boom');
        };

        assert.throws(() => Logger.checkFunctionExecutionTime(fail)(), {message: 'boom'});
        assert.equal(lastCall()[1], 'fail execution takes 20ms');
    });

    it('waits for thenables that are not native promises', async () => {
        fakeElapsed(30);
        const thenable = (): PromiseLike<number> => ({
            then: (onFulfilled, onRejected) =>
                new Promise<number>(resolve => setTimeout(resolve, 0, 1)).then(onFulfilled, onRejected)
        });

        assert.equal(await Logger.checkFunctionExecutionTime(thenable)(), 1);
        assert.equal(lastCall()[1], 'thenable execution takes 30ms');
    });

    it('falls back to "anonymousFunc" for unnamed functions', () => {
        fakeElapsed(5);

        Logger.checkFunctionExecutionTime(() => {})();

        assert.equal(lastCall()[1], 'anonymousFunc execution takes 5ms');
    });

    it('works when detached from Logger', () => {
        fakeElapsed(5);
        const {checkFunctionExecutionTime, info} = Logger;

        checkFunctionExecutionTime(() => {})();
        info('x');

        assert.equal(logSpy.mock.callCount(), 2);
    });

    for (const fixed of [-1, 1.5, 101, NaN]) {
        it(`throws RangeError for invalid fixed=${fixed}`, () => {
            assert.throws(() => Logger.checkFunctionExecutionTime(() => {}, {fixed}), RangeError);
        });
    }
});

describe('Logger.configure', () => {
    it('drops messages below the configured level', () => {
        Logger.configure({level: LogTypes.warn});

        Logger.info('skip');
        Logger.warn('keep');
        Logger.error('keep');

        const types = logSpy.mock.calls.map(call => (call.arguments[0] as string).includes('[warn]'));
        assert.deepEqual(types, [true, false]);
    });

    it('uses configured type, offset and fixed as checkFunctionExecutionTime defaults', () => {
        Logger.configure({type: LogTypes.warn, offset: 10, fixed: 1});
        function slow(): void {}

        fakeElapsed(5);
        Logger.checkFunctionExecutionTime(slow)();
        assert.equal(logSpy.mock.callCount(), 0);

        mock.restoreAll();
        logSpy = mock.method(console, 'log', () => {});
        fakeElapsed(12.34);
        Logger.checkFunctionExecutionTime(slow)();

        const [prefix, msg] = lastCall();
        assert.ok((prefix as string).includes('[warn]'));
        assert.equal(msg, 'slow execution takes 12.3ms');
    });

    it('options override configured defaults', () => {
        Logger.configure({type: LogTypes.warn, fixed: 2});
        fakeElapsed(12.34);

        Logger.checkFunctionExecutionTime(() => {}, {type: LogTypes.error, fixed: 0})();

        const [prefix, msg] = lastCall();
        assert.ok((prefix as string).includes('[error]'));
        assert.equal(msg, 'anonymousFunc execution takes 12ms');
    });

    it('applies to functions wrapped before configure', () => {
        const wrapped = Logger.checkFunctionExecutionTime(() => {});
        Logger.configure({level: LogTypes.error});
        fakeElapsed(5);

        wrapped();

        assert.equal(logSpy.mock.callCount(), 0);
    });

    it('applies level to checkFunctionExecutionTime output', () => {
        Logger.configure({level: LogTypes.warn});
        fakeElapsed(5);

        Logger.checkFunctionExecutionTime(() => {})();

        assert.equal(logSpy.mock.callCount(), 0);
    });

    for (const fixed of [-1, 1.5, 101, NaN]) {
        it(`throws RangeError for invalid fixed=${fixed} and keeps previous config`, () => {
            assert.throws(() => Logger.configure({fixed}), RangeError);

            fakeElapsed(1.26);
            Logger.checkFunctionExecutionTime(() => {})();
            assert.equal(lastCall()[1], 'anonymousFunc execution takes 1ms');
        });
    }
});
