import express, { Router, Request, Response } from 'express';
import HttpStatus from 'http-status-codes';

const router: Router = express.Router();

export function healthRoutes(): Router {
  router.get('/health', (_req: Request, res: Response) => {
    res.status(HttpStatus.OK).send('Notification service is healthy');
  });

  return router;
}
