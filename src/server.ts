import { config } from '@notifications/config';
import { checkElasticSearchConnection } from '@notifications/elasticsearch';
import { createRabbitMQConnection } from '@notifications/queues/connection';
import { consumeAuthEmailMessage, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';
import { healthRoutes } from '@notifications/routes';
import { IEmailMessageDetails, winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { Channel } from 'amqplib';
import { Application } from 'express';
import 'express-async-errors';
import http from 'http';
import { Logger } from 'winston';

const SERVER_PORT = 4001;
const log: Logger = winstonLogger(config.ELASTIC_SEARCH_URL!, 'notification-service', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel = (await createRabbitMQConnection()) as Channel;
  await consumeAuthEmailMessage(emailChannel);

  //const verificationLink = `${config.CLIENT_URL}/verify-email?token=someRandomToken`;
  /* const messageDetails: IEmailMessageDetails = {
    receiverEmail: `${config.SENDER_EMAIL}`,
    verifyLink: verificationLink,
    template: 'verifyEmail'
  }; */

  const forgotPasswordDetails: IEmailMessageDetails = {
    receiverEmail: `${config.SENDER_EMAIL}`,
    resetLink: `${config.CLIENT_URL}/reset-password?token=123test456test1234`,
    username: 'John Doe',
    template: 'forgotPassword'
  };

  await emailChannel.assertExchange('jobber-email-notification', 'direct');
  const message = JSON.stringify(forgotPasswordDetails);
  emailChannel.publish('jobber-email-notification', 'auth-email', Buffer.from(message));

  await consumeOrderEmailMessages(emailChannel);
  await emailChannel.assertExchange('jobber-order-notification', 'direct');
  const orderMessage = JSON.stringify({ name: 'Jobber', service: 'Order Notification Service' });
  emailChannel.publish('jobber-order-notification', 'order-email', Buffer.from(orderMessage));
}

async function startElasticSearch(): Promise<void> {
  await checkElasticSearchConnection();
}

function startServer(app: Application): void {
  try {
    const httpServer: http.Server = new http.Server(app);
    log.info(`Worker with process id of ${process.pid} on notification server has started.`);
    httpServer.listen(SERVER_PORT, () => {
      log.info(`Notification server running on port ${SERVER_PORT}`);
    });
  } catch (error) {
    log.log('error', `NotificationService startServer() method:`, error);
  }
}
