import {BaseUrl} from '@/const';

const getLayout = (children: string): string => {
    return `
        <!doctype html>
        <html lang="en">        
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" type="image/svg+xml" href="${BaseUrl}/assets/favicon/favicon.ico" />
                <title>Todo list practice</title>
                <link rel="stylesheet" href="${BaseUrl}/assets/styles/index.css" />
            </head>
            <body>
                <main>
                    ${children}
                </main>
            </body>
        </html>
    `;
};

export default getLayout;
