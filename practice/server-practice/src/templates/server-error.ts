import {getLayout} from './base';

const getServerErrorPage = (): string => {
    const content = `
        <div class="error">
            <h1 class="title">Server Error</h1>
            <h2 class="error-code">500</h2>
            <a href="/" class="button button-primary">To Home page</a>
        </div>
    `;

    return getLayout(content);
};

export default getServerErrorPage;
