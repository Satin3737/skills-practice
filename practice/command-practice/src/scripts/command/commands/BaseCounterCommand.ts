import type Counter from '@/scripts/Counter';
import Command from '../Command';

abstract class BaseCounterCommand extends Command {
    protected counter: Counter;

    private backup: number = 0;

    public constructor(counter: Counter) {
        super();
        this.counter = counter;
    }

    public exec(): void {
        this.backup = this.counter.count;
        this.do();
    }

    public undo(): void {
        this.counter.count = this.backup;
    }

    protected abstract do(): void;
}

export default BaseCounterCommand;
