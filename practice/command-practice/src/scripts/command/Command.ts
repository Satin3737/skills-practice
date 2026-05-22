import type Counter from '@/scripts/Counter';

abstract class Command {
    protected counter: Counter;

    private backup: number = 0;

    public constructor(counter: Counter) {
        this.counter = counter;
    }

    public abstract exec(): void;

    public undo(): void {
        this.counter.count = this.backup;
    }

    public saveBackup(): void {
        this.backup = this.counter.count;
    }
}

export default Command;
