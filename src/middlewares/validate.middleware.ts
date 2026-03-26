import { NextFunction, Request, Response } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
};
