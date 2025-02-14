import fs from 'fs';
import path from 'path';
import { CustomError } from './customError';

export const getEmailTemplate = (templateName: string, variables: Map<string, string>) => {
    try {
        const templatePath = path.join(__dirname, '../../emailTemplates', `${templateName}.html`);
        let template = fs.readFileSync(templatePath, 'utf-8');
        variables.forEach((value, key) => {
            const regex = new RegExp(`\\$\\{${key}\\}`, "g");
            template = template.replace(regex, value);
        });
        return template;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new CustomError(500, err.message, "EMAIL ERROR")
        } else {
            throw new CustomError(500, "An unknown error has been occured", "EMAIL ERROR")
        }
    }

}