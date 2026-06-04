import express, { Express } from 'express';
import { start } from '@notifications/server';

function initializeApp(): void {
  const app: Express = express();
  start(app);
}

initializeApp();
