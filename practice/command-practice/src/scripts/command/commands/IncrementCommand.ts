import Command from '../Command';

class IncrementCommand extends Command {
    public exec(): void {
        this.counter.increment();
    }
}

export default IncrementCommand;
