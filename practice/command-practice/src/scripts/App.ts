import Counter from '@/scripts/Counter';
import {CommandsRunner, DecrementCommand, IncrementCommand, ResetCommand, SetCommand} from '@/scripts/command';
import {queryOrThrow} from '@/scripts/helper';

class App {
    private readonly counter: Counter;
    private readonly commandsRunner: CommandsRunner;
    private readonly counterDisplay: HTMLHeadingElement;
    private readonly undoBtn: HTMLButtonElement;
    private readonly redoBtn: HTMLButtonElement;
    private readonly input: HTMLInputElement;

    public constructor() {
        this.counter = new Counter();
        this.commandsRunner = new CommandsRunner();

        this.counterDisplay = queryOrThrow<HTMLHeadingElement>('[data-counter]');
        this.undoBtn = queryOrThrow<HTMLButtonElement>('[data-action="undo"]');
        this.redoBtn = queryOrThrow<HTMLButtonElement>('[data-action="redo"]');
        this.input = queryOrThrow<HTMLInputElement>('[data-action="input"]');

        this.init();
    }

    private listenButtons(): void {
        document.addEventListener('click', e => {
            const target = e.target;
            if (!target || !(target instanceof HTMLButtonElement)) return;

            switch (target.dataset.action) {
                case 'increment':
                    this.commandsRunner.runCommand(new IncrementCommand(this.counter));
                    break;
                case 'decrement':
                    this.commandsRunner.runCommand(new DecrementCommand(this.counter));
                    break;
                case 'reset':
                    this.commandsRunner.runCommand(new ResetCommand(this.counter));
                    break;
                case 'set':
                    this.submitInput();
                    break;
                case 'undo':
                    this.commandsRunner.undo();
                    break;
                case 'redo':
                    this.commandsRunner.redo();
                    break;
                default:
                    return;
            }

            this.update();
        });
    }

    private listenInput(): void {
        this.input.addEventListener('input', () => {
            this.input.value = this.input.value.replace(/(?!^-)\D/g, '');
        });
    }

    private listenKeyDown(): void {
        document.addEventListener('keydown', e => {
            if (document.activeElement === this.input && e.key === 'Enter') {
                e.preventDefault();
                this.submitInput();
                this.update();
            }

            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.commandsRunner.undo();
                    this.update();
                }

                if (e.key === 'y') {
                    e.preventDefault();
                    this.commandsRunner.redo();
                    this.update();
                }
            }
        });
    }

    private submitInput(): void {
        const count = Number(this.input.value);
        if (!Number.isFinite(count)) return;
        this.commandsRunner.runCommand(new SetCommand(this.counter, count));
        this.input.value = '';
    }

    private updateCounterDisplay(): void {
        this.counterDisplay.textContent = this.counter.count.toString();
    }

    private updateBtnsStates(): void {
        this.undoBtn.disabled = !this.commandsRunner.canUndo;
        this.redoBtn.disabled = !this.commandsRunner.canRedo;
    }

    private update(): void {
        this.updateCounterDisplay();
        this.updateBtnsStates();
    }

    private init(): void {
        this.update();
        this.listenButtons();
        this.listenInput();
        this.listenKeyDown();
    }
}

export default App;
