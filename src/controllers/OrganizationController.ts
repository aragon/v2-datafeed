import { Request, Response } from 'express'

import HttpError from '../lib/HttpError'
import Organization from '../models/Organization'

export default {
  async all(request: Request, response: Response) {
    const total = await Organization.count()
    const value = await Organization.totalAntValue()
    response.status(200).send({ total, value })
  },

  async show(request: Request, response: Response) {
    const organization = await Organization.findByAddress(request.params.address)
    if (!organization) throw HttpError.NOT_FOUND('Organization not found')
    const { createdAt, address, executor, valueUSD, valueANT, ant } = organization
    response.status(200).send({ createdAt, address, executor, valueUSD, valueANT, ant })
  }
}
