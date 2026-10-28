import $ from 'jquery';
import formSchema, {serverErrorsSchema} from './schema';
import type {IError, IFormValues} from './types';

class FormHandler {
    private readonly submitUrl = 'https://httpbin.org/post';
    private readonly submitTimeoutMs = 5000;
    private readonly $form: JQuery<HTMLFormElement>;
    private readonly $responseSuccess: JQuery<HTMLDivElement>;
    private readonly $responseError: JQuery<HTMLDivElement>;

    public constructor($form: JQuery<HTMLFormElement>) {
        this.$form = $form;
        this.$responseSuccess = $('[data-response="success"]', this.$form);
        this.$responseError = $('[data-response="error"]', this.$form);
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

    private showResponse($el: JQuery<HTMLDivElement>): void {
        $el.stop(true)
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

    private async submit(data: IFormValues): Promise<IError[]> {
        const response = await fetch(this.submitUrl, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data),
            signal: AbortSignal.timeout(this.submitTimeoutMs)
        });

        if (response.status === 422) {
            return serverErrorsSchema.parse(await response.json()).errors;
        }

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return [];
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
            const serverErrors = await this.submit(data);

            if (serverErrors.length) {
                this.showErrors(serverErrors);
                return;
            }

            this.$form[0].reset();
            this.showResponse(this.$responseSuccess);
        } catch (e) {
            console.error(e);
            this.showResponse(this.$responseError);
        } finally {
            this.setLoading(false);
        }
    }
}

export default FormHandler;
