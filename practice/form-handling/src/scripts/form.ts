import $ from 'jquery';
import type {z} from 'zod';
import formSchema from './schema';

interface IFormValues {
    name: string;
    surname: string;
    age: number;
    email: string;
    color: string;
    preferences: string[];
    comment: string;
}

type IError = z.core.$ZodIssue;

class FormHandler {
    private readonly $form: JQuery<HTMLFormElement>;
    private readonly $response: JQuery<HTMLDivElement>;

    public constructor($form: JQuery<HTMLFormElement>) {
        this.$form = $form;
        this.$response = $('.response', this.$form);
        this.initListeners();
    }

    private initListeners(): void {
        this.$form.on('submit', e => void this.handleSubmit(e));

        this.$form.on('input', '.field input, .field textarea', e => {
            this.clearErrors($(e.currentTarget).closest('.field'));
        });

        this.$form.on('change', '.radio-group input', () => {
            this.clearErrors($('.radio-group', this.$form));
        });

        this.$form.on('change', '.checkbox-group input', () => {
            this.clearErrors($('.checkbox-group', this.$form));
        });
    }

    private clearErrors(context: JQuery = this.$form): void {
        $('.error', context).text('');
    }

    private showErrors(errors: IError[]): void {
        const groupsErrorsMap: Record<string, string> = {
            color: '.radio-group .error',
            preferences: '.checkbox-group .error'
        };

        for (const error of errors) {
            const key = String(error.path[0]);
            const selector = groupsErrorsMap[key] ?? `.field:has([name="${key}"]) .error`;
            $(selector, this.$form).text(error.message);
        }
    }

    private collectFieldValue(name: string): string {
        return String($(`[name="${name}"]`, this.$form).val() ?? '');
    }

    private collectData(): IFormValues {
        return {
            name: this.collectFieldValue('name'),
            surname: this.collectFieldValue('surname'),
            age: Number(this.collectFieldValue('age')),
            email: this.collectFieldValue('email'),
            color: String($('[name="color"]:checked', this.$form).val() ?? ''),
            preferences: $('.checkbox-group input:checked', this.$form)
                .map((_, el) => $(el).attr('name'))
                .get(),
            comment: this.collectFieldValue('comment')
        };
    }

    private showResponse(): void {
        this.$response
            .stop(true)
            .addClass('_show')
            .delay(3000)
            .queue(function (next) {
                $(this).removeClass('_show');
                next();
            });
    }

    private setLoading(state: boolean): void {
        $('.submit', this.$form).prop('disabled', state).toggleClass('_loading', state);
    }

    private fakeSubmit(data: IFormValues): Promise<void> {
        console.log('From submitted with data', data);
        return new Promise(resolve => setTimeout(resolve, 3000));
    }

    private async handleSubmit(e: JQuery.SubmitEvent): Promise<void> {
        e.preventDefault();

        this.clearErrors();

        const rawData = this.collectData();
        const {success, data, error} = formSchema.safeParse(rawData);

        if (!success) {
            this.showErrors(error.issues);
            return;
        }

        this.setLoading(true);

        try {
            await this.fakeSubmit(data);
            this.$form[0].reset();
            this.showResponse();
        } catch (e) {
            console.error(e);
        } finally {
            this.setLoading(false);
        }
    }
}

export default FormHandler;
