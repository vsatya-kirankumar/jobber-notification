import { IEmailLocals, winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';
import path from 'path';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

export const emailTemplates = async (template: string, receiver: string, locals: IEmailLocals): Promise<void> => {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });

    const email: Email = new Email({
      message: {
        from: `Jobber App <${config.SENDER_EMAIL}>`
      },
      transport: smtpTransport as Transporter,
      send: true,
      preview: false,
      views: {
        root: 'src/templates',
        options: {
          extension: 'ejs' // Specify the template file extension
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: { relativeTo: path.join(__dirname, '../build') }
      }
    });

    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: {
        to: receiver
      },
      locals
    });
  } catch (error) {
    log.log('error', 'NotificationService emailTemplates() method error:', error);
  }
};
