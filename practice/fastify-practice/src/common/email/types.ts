export interface IEmailTemplate {
    subject: string;
    html: string;
}

export interface IEmailOptions extends IEmailTemplate {
    to: string;
}
