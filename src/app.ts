import express, { Express } from 'express';
import { start } from '@notifications/server';
import { Logger } from 'winston';
import { winstonLogger } from '@vsatya-kirankumar/jobber-shared';
import { config } from '@notifications/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationApp', 'debug');

function initializeApp(): void {
  const app: Express = express();
  start(app);
  log.info('Notification service Initialized.');
}

initializeApp();
