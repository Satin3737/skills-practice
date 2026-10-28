import BaseCounterCommand from './BaseCounterCommand';

class IncrementCommand extends BaseCounterCommand {
    protected do(): void {
        this.counter.increment();
    }
}

export default IncrementCommand;
