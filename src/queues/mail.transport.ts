import { IEmailLocals, winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import { emailTemplates } from '@notifications/helpers';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

export const sendEmail = async (template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> => {
  try {
    await emailTemplates(template, receiverEmail, locals);
    log.info(`Sending email to ${receiverEmail} using template ${template} with locals: ${JSON.stringify(locals)}`);
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error:', error);
  }
};
