import {escapeHtml} from '@/helpers';
import {getLayout} from './base';

const getServerErrorPage = (status: number, message: string): string => {
    const content = `
        <div class="error">
            <h1 class="title">${escapeHtml(status < 500 ? 'Error' : 'Server Error')}</h1>
            <h2 class="error-code">${escapeHtml(String(status))}</h2>
            <p class="message">${escapeHtml(message)}</p>
            <a href="/" class="button button-primary">To Home page</a>
        </div>
    `;

    return getLayout(content);
};

export default getServerErrorPage;
