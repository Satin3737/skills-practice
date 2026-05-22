import type Command from './Command';

class CommandsRunner {
    private undoList: Command[] = [];
    private redoList: Command[] = [];

    public get canUndo(): boolean {
        return !!this.undoList.length;
    }

    public get canRedo(): boolean {
        return !!this.redoList.length;
    }

    public runCommand(command: Command): void {
        command.saveBackup();
        command.exec();
        this.undoList.push(command);
        this.redoList = [];
    }

    public undo(): void {
        const command = this.undoList.pop();
        if (!command) return;
        command.undo();
        this.redoList.push(command);
    }

    public redo(): void {
        const command = this.redoList.pop();
        if (!command) return;
        command.exec();
        this.undoList.push(command);
    }
}

export default CommandsRunner;
