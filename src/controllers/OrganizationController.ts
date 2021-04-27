import { Request, Response } from 'express'

import { decimal } from '../helpers/numbers'

import Asset from '../models/Asset'
import HttpError from '../models/HttpError'
import Organization from '../models/Organization'
import OrganizationBalance from '../models/OrganizationBalance'

const TARGET = decimal(100e6)  // 100M USD
const REWARD = decimal(100e3)  // 100k ANT
const OPTIONS = decimal(1e6)   // 1M
const CAP_PRICE = decimal(0.1) // 0.1 ANT

export default {
  async all(request: Request, response: Response) {
    const count = await Organization.count()
    const last = (await Organization.last())?.createdAt || 0
    const total = await Organization.totalValue()
    const optionPrice = decimal(total).div(TARGET).mul(REWARD.div(OPTIONS))
    const option = optionPrice > CAP_PRICE ? CAP_PRICE : optionPrice
    response.status(200).send({ count, last, total, option })
  },

  async show(request: Request, response: Response) {
    const organization = await Organization.findByAddress(request.params.address)
    if (!organization) throw HttpError.NOT_FOUND('Organization not found')

    const orgBalances = await OrganizationBalance.findByOrganization(organization)
    const balances = Promise.all(orgBalances.map(async ({ assetId, price, amount, value }) => {
      const asset = await Asset.findById(assetId)
      return { asset: { address: asset?.address, symbol: asset?.symbol, decimals: asset?.decimals }, price, amount, value }
    }));

    const { createdAt, address, executor, value, syncedAt } = organization
    response.status(200).send({ createdAt, address, executor, value, syncedAt, balances })
  }
}
