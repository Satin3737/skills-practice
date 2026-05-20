import {ClientError, GraphQLClient} from 'graphql-request';
import {CreateUserDocument, GetUserDocument, ListUsersDocument} from '@/__generated__/graphql';
import '@/client/styles/index.css';

class UserApp {
    private readonly client: GraphQLClient;
    private readonly resultEl: HTMLElement;

    public constructor() {
        const resultEl = document.querySelector<HTMLElement>('[data-result]');
        if (!resultEl) throw new Error('Missing [data-result] element');

        this.client = new GraphQLClient('http://localhost:8080/graphql');
        this.resultEl = resultEl;

        this.initListeners();
    }

    private show(data: unknown): void {
        this.resultEl.textContent = JSON.stringify(data, null, 2);
    }

    private input(key: string): string {
        return document.querySelector<HTMLInputElement>(`[data-input="${key}"]`)?.value ?? '';
    }

    private async getById(): Promise<void> {
        const id = Number(this.input('id'));
        const data = await this.client.request(GetUserDocument, {id});
        this.show(data.user);
    }

    private async list(): Promise<void> {
        const name = this.input('filter-name') || undefined;
        const ageRaw = this.input('filter-age');
        const age = ageRaw ? Number(ageRaw) : undefined;
        const data = await this.client.request(ListUsersDocument, {name, age});
        this.show(data.users);
    }

    private async create(): Promise<void> {
        const name = this.input('name');
        const age = Number(this.input('age'));

        try {
            const data = await this.client.request(CreateUserDocument, {input: {name, age}});
            this.show(data.createUser);
        } catch (error) {
            if (error instanceof ClientError) {
                const {errors} = error.response;

                this.show({
                    error: errors?.[0]?.message,
                    fields: errors?.[0]?.extensions?.['errors']
                });
            } else {
                if (error instanceof Error) {
                    this.show({error: error.message});
                } else {
                    this.show({error});
                }
            }
        }
    }

    private initListeners(): void {
        document.querySelector('[data-action="get-by-id"]')?.addEventListener('click', () => this.getById());
        document.querySelector('[data-action="list"]')?.addEventListener('click', () => this.list());
        document.querySelector('[data-action="create"]')?.addEventListener('click', () => this.create());
    }
}

new UserApp();
