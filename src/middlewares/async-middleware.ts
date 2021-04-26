import { Request, Response, NextFunction } from 'express'

export default (fn: (req: Request, res: Response, next: NextFunction) => {}) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next)
