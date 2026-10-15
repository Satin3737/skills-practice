import type {INewTodo} from '@/features/todos';
import {escapeHtml} from '@/helpers';
import {getLayout} from './base';

const getNewTodoPage = (values?: Partial<INewTodo>, error?: Partial<INewTodo>): string => {
    const content = `
        <a href="/" class="button button-secondary back-btn">
            < Back
        </a>
        <form action="/todos" method="post" class="form">
            <h1 class="title">
                Add new todo
            </h1>
            <fieldset class="fields">
                <legend class="legend">
                    Fill todo data:
                </legend>
                <label class="field">
                    Title
                    <input 
                        type="text" 
                        name="title" 
                        placeholder="Learn Node"
                        value="${escapeHtml(values?.title ?? '')}"
                        required 
                    />
                    <span class="error">${escapeHtml(error?.title ?? '')}</span>
                </label>
                <label class="field">
                    Description
                    <textarea 
                        name="description" 
                        placeholder="Lear Node as soon as possible"
                        required
                    >${escapeHtml(values?.description ?? '')}</textarea>
                    <span class="error">${escapeHtml(error?.description ?? '')}</span>
                </label>
            </fieldset>
            <button type="submit" class="button button-primary">
                Submit
            </button>
        </form>
    `;

    return getLayout(content);
};

export default getNewTodoPage;
