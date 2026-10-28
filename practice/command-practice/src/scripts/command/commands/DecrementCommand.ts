import BaseCounterCommand from './BaseCounterCommand';

class DecrementCommand extends BaseCounterCommand {
    protected do(): void {
        this.counter.decrement();
    }
}

export default DecrementCommand;
