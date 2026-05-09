import type {INewTodo} from '@/features/todos';
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
                        value="${values?.title ?? ''}"
                        required 
                    />
                    <div class="error">${error?.title ?? ''}</div>
                </label>
                <label class="field">
                    Description
                    <textarea 
                        name="description" 
                        placeholder="Lear Node as soon as possible"
                        required
                    >${values?.description ?? ''}</textarea>
                    <div class="error">${error?.description ?? ''}</div>
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
