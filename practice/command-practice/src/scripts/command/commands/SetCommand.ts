import type Counter from '@/scripts/Counter';
import Command from '../Command';

class SetCommand extends Command {
    private count: number;

    public constructor(counter: Counter, count: number) {
        super(counter);
        this.count = count;
    }

    public exec(): void {
        this.counter.count = this.count;
    }
}

export default SetCommand;
