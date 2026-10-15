import {getLayout} from './base';

const getNotFoundPage = (): string => {
    const content = `
        <div class="error-page">
            <h1 class="title">Page not found</h1>
            <h2 class="error-page-code">404</h2>
            <a href="/" class="button button-primary">To Home page</a>
        </div>
    `;

    return getLayout(content);
};

export default getNotFoundPage;
