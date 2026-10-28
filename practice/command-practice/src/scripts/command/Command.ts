abstract class Command {
    public abstract exec(): void;
    public abstract undo(): void;
}

export default Command;
