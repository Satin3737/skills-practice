import {LogTypes, Logger} from './logger';

const fibonacci = (n: number): number => {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
};

// -----------------------------

Logger.info('Fancy info');
Logger.warn('Fancy warning');
Logger.error('Fancy error');

// -----------------------------

Logger.checkFunctionExecutionTime(fibonacci)(42);
Logger.checkFunctionExecutionTime(fibonacci, {offset: 3000})(42);
Logger.checkFunctionExecutionTime(fibonacci, {fixed: 2})(42);
Logger.checkFunctionExecutionTime(fibonacci, {type: LogTypes.error, offset: 1000})(42);

// -----------------------------

class TestClass {
    private readonly someContext = 'this here, we good';

    public checkContextAvailability(num: number): void {
        Logger.info(this.someContext);
        fibonacci(num);
    }
}

const testClass = new TestClass();
Logger.checkFunctionExecutionTime(testClass.checkContextAvailability.bind(testClass))(42);

// -----------------------------

const fibonacciCheckWithPredefinedOptions = Logger.checkFunctionExecutionTime(fibonacci, {
    type: LogTypes.info,
    fixed: 1,
    offset: 2000
});

fibonacciCheckWithPredefinedOptions(42);
fibonacciCheckWithPredefinedOptions(40);

// -----------------------------

const showAfterAsyncDelay = async (str: string): Promise<void> => {
    await new Promise(res => setTimeout(res, 4000));
    Logger.info(str);
};

Logger.checkFunctionExecutionTime(showAfterAsyncDelay)('delayed text');
