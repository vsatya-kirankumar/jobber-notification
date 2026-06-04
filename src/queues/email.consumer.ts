import { ConsumeMessage, Channel } from 'amqplib';
import { config } from '@notifications/config';
import { IEmailLocals, winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { Logger } from 'winston';
import { createRabbitMQConnection } from '@notifications/queues/connection';
import { sendEmail } from '@notifications/queues/mail.transport';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

async function consumeAuthEmailMessage(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = await createRabbitMQConnection();
    }
    const exchangeName = 'jobber-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const jobberQueue = await channel.assertQueue(queueName, { exclusive: true, durable: true, autoDelete: false });

    // This tells RabbitMQ not to give more than 1 message to a worker at a time
    channel.prefetch(1);
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    log.info(`Waiting for messages in queue: ${jobberQueue.queue}. To exit press CTRL+C`);

    // consume messages from the queue
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const messageContent = JSON.parse(msg!.content.toString());
      const { receiverEmail, username, verifyLink, resetLink, template } = messageContent;
      const locals: IEmailLocals = {
        appLink: config.CLIENT_URL!,
        appIcon: 'https://i.bb.co/Kyp2m0t/cover.png',
        username,
        verifyLink,
        resetLink
      };
      await sendEmail(template, receiverEmail, locals);
      log.info(`Received auth email message: ${messageContent}`);
      //send email
      //sendEmail()
      // Acknowledge the message after processing
      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService consumeAuthEmailMessage() method error:', error);
  }
}

async function consumeOrderEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = await createRabbitMQConnection();
    }
    const exchangeName = 'jobber-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';

    await channel.assertExchange(exchangeName, 'direct', { durable: true });
    const jobberQueue = await channel.assertQueue(queueName, { exclusive: true, durable: true, autoDelete: false });

    // This tells RabbitMQ not to give more than 1 message to a worker at a time
    channel.prefetch(1);
    await channel.bindQueue(jobberQueue.queue, exchangeName, routingKey);
    log.info(`Waiting for messages in queue: ${jobberQueue.queue}. To exit press CTRL+C`);

    // consume messages from the queue
    channel.consume(jobberQueue.queue, async (msg: ConsumeMessage | null) => {
      const messageContent = JSON.parse(msg!.content.toString());
      const {
        receiverEmail,
        username,
        template,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      } = messageContent;

      const locals: IEmailLocals = {
        appLink: `${config.CLIENT_URL}`,
        appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
        username,
        sender,
        offerLink,
        amount,
        buyerUsername,
        sellerUsername,
        title,
        description,
        deliveryDays,
        orderId,
        orderDue,
        requirements,
        orderUrl,
        originalDate,
        newDate,
        reason,
        subject,
        header,
        type,
        message,
        serviceFee,
        total
      };

      if (template === 'orderPlaced') {
        await sendEmail('orderPlaced', receiverEmail, locals);
        await sendEmail('orderReceipt', receiverEmail, locals);
      } else {
        await sendEmail(template, receiverEmail, locals);
      }
      log.info(`Received auth email message: ${messageContent}`);

      channel.ack(msg!);
    });
  } catch (error) {
    log.log('error', 'NotificationService consumeAuthEmailMessage() method error:', error);
  }
}

export { consumeAuthEmailMessage, consumeOrderEmailMessages };
