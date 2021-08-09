import { Request, Response } from 'express'

import { decimal, fixed } from '../helpers/numbers'

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
    const last = (await Organization.last())?.migratedAt || 0
    const total = await Organization.totalValue()
    const optionPrice = decimal(total).div(TARGET).mul(REWARD.div(OPTIONS))
    const option = fixed(optionPrice.gt(CAP_PRICE) ? CAP_PRICE : optionPrice)
    response.status(200).send({ count, last, total, option })
  },

  async show(request: Request, response: Response) {
    const organization = await Organization.findByExecutor(request.params.address)
    if (!organization) throw HttpError.NOT_FOUND('Organization not found')

    const balances = []
    const orgBalances = await OrganizationBalance.findByOrganization(organization)
    for (const { assetId, price, amount, value } of orgBalances) {
      const asset = await Asset.findById(assetId)
      balances.push({ asset: { address: asset?.address, symbol: asset?.symbol, decimals: asset?.decimals }, price, amount, value })
    }

    const { address, executor, value, migratedAt, createdAt } = organization
    response.status(200).send({ address, executor, value, migratedAt, createdAt, balances })
  }
}
