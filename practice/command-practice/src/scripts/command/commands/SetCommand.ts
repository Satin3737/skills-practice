import type Counter from '@/scripts/Counter';
import BaseCounterCommand from './BaseCounterCommand';

class SetCommand extends BaseCounterCommand {
    private count: number;

    public constructor(counter: Counter, count: number) {
        super(counter);
        this.count = count;
    }

    protected do(): void {
        this.counter.count = this.count;
    }
}

export default SetCommand;
