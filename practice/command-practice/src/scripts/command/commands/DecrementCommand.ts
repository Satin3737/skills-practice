import Command from '../Command';

class DecrementCommand extends Command {
    public exec(): void {
        this.counter.decrement();
    }
}

export default DecrementCommand;
