import type {FastifyBaseLogger} from 'fastify';
import nodemailer, {type Transporter} from 'nodemailer';
import type {Options, SentMessageInfo} from 'nodemailer/lib/smtp-transport';
import type {IEmailOptions} from './types';

class EmailService {
    private readonly client: Transporter<SentMessageInfo, Options>;
    private readonly sender: string = 'enlist@empire.com';
    private readonly logger: FastifyBaseLogger;

    public constructor(logger: FastifyBaseLogger, options: Options) {
        this.logger = logger;
        this.client = nodemailer.createTransport(options);
    }

    public async sendMail(options: IEmailOptions): Promise<SentMessageInfo | void> {
        try {
            const result = await this.client.sendMail({from: this.sender, ...options});
            this.logger.info(result, 'Email sent successfully');
            return result;
        } catch (error) {
            this.logger.error(error, 'Error sending email');
        }
    }
}

export default EmailService;
