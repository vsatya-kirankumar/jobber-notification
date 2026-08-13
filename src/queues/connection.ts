import { winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { config } from '@notifications/config';
import { Logger } from 'winston';
import amqp, { Channel, ChannelModel } from 'amqplib';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

export async function createRabbitMQConnection(): Promise<Channel> {
  try {
    log.info('Notification service: Creating connection to RabbitMQ...');

    const connection: ChannelModel = await amqp.connect(`${config.RABBITMQ_ENDPOINT}`);
    const channel: Channel = await connection.createChannel();
    log.info('Successfully connected to RabbitMQ.');
    closeConnection(connection, channel);
    return channel;
  } catch (error) {
    log.error('Failed to connect to RabbitMQ:', error);

    throw error;
  }
}

function closeConnection(connection: ChannelModel, channel: Channel): void {
  process.once('SIGINT', async () => {
    try {
      await channel.close();
      await connection.close();
      log.info('RabbitMQ connection closed gracefully.');
      process.exit(0);
    } catch (error) {
      log.error('Error closing RabbitMQ connection:', error);
      process.exit(1);
    }
  });
}
