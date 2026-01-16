import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<void>;

export function withAsync(handler: AsyncRequestHandler): RequestHandler {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await handler(req, res);
    } catch (e) {
      next(e);
    }
  };
}
