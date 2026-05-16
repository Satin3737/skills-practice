import {type TRPCClient, createTRPCClient, httpBatchLink} from '@trpc/client';
import '@/client/styles/index.css';
import type {AppRouter} from '@/server/router';

class SimpleTrpc {
    private readonly client: TRPCClient<AppRouter>;
    private readonly fields: HTMLInputElement[];
    private readonly resultEl: HTMLDivElement;

    constructor() {
        this.client = createTRPCClient<AppRouter>({
            links: [httpBatchLink({url: 'http://localhost:8080/trpc'})]
        });

        this.fields = Array.from(document.querySelectorAll<HTMLInputElement>('[data-input]'));

        const resultEl = document.querySelector<HTMLDivElement>('[data-result]');
        if (!resultEl) throw new Error('No results node found!');
        this.resultEl = resultEl;

        this.initListeners();
    }

    private getInputValue(key: string): string {
        return this.fields.find(input => input.dataset.input === key)?.value ?? '';
    }

    private show(data: unknown): void {
        this.resultEl.textContent = JSON.stringify(data, null, 2);
    }

    private initListeners(): void {
        document.querySelector('[data-action="get-by-id"]')?.addEventListener('click', async () => {
            const id = Number(this.getInputValue('id'));
            const user = await this.client.user.getById.query({id});
            this.show(user);
        });

        document.querySelector('[data-action="list"]')?.addEventListener('click', async () => {
            const users = await this.client.user.list.query();
            this.show(users);
        });

        document.querySelector('[data-action="create"]')?.addEventListener('click', async () => {
            const name = this.getInputValue('name');
            const age = Number(this.getInputValue('age'));

            try {
                const created = await this.client.user.create.mutate({name, age});
                this.show({created});
            } catch (err) {
                this.show({error: (err as Error).message});
            }
        });
    }
}

new SimpleTrpc();
