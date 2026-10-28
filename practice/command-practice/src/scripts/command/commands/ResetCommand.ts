import BaseCounterCommand from './BaseCounterCommand';

class ResetCommand extends BaseCounterCommand {
    protected do(): void {
        this.counter.reset();
    }
}

export default ResetCommand;
