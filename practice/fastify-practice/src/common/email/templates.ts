import {escapeHtml} from '@/common/helper';
import type {IEmailTemplate} from './types';

class EmailTemplates {
    public static getWelcomeTemplate(callSign: string): IEmailTemplate {
        return {
            subject: `Welcome, ${callSign}!`,
            html: `
                <div>
                    <h1>Welcome, ${escapeHtml(callSign)}!</h1>
                    <p>Empire welcomes you!</p>
                </div>
            `
        };
    }

    public static getMissionCompletedTemplate(title: string, planet: string): IEmailTemplate {
        return {
            subject: `Mission Completed: ${title}`,
            html: `
                <div>
                    <h1>Mission Completed: ${escapeHtml(title)}</h1>
                    <p>Congratulations! The mission on ${escapeHtml(planet)} has been successfully completed.</p>
                </div>
            `
        };
    }
}

export default EmailTemplates;
