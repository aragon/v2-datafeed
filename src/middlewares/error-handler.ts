import HttpError from '../lib/HttpError'
import { Request, Response, NextFunction } from 'express'

export default (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err)
  }

  if (err instanceof HttpError) {
    return res.status(err.code).send({ error: err.content })
  }

  if (err instanceof SyntaxError) {
    return res.status(400).send({ error: 'Make sure your request is a well formed JSON' })
  }

  if (err.message.includes('CORS')) {
    return res.status(400).send({ error: err.message })
  }

  console.error(err.stack)
  res.status(500).send({ error: 'Something went wrong :(' })
}
