import Command from '../Command';

class ResetCommand extends Command {
    public exec(): void {
        this.counter.reset();
    }
}

export default ResetCommand;
