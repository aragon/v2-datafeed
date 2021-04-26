import { Decimal } from 'decimal.js'

import { decimal } from '../helpers/numbers'
import Logger from '../helpers/logger'

import Asset from '../models/Asset'
import Organization from '../models/Organization'
import OrganizationBalance from '../models/OrganizationBalance'

const logger = Logger.create('calculator')
const ANT_ADDRESS = process.env.ANT_ADDRESS!

class MigratedValueCalculator {
  async call(): Promise<void> {
    const organizations = await Organization.withoutValue()
    logger.info(`Calculating the migrated value for ${organizations.length} organizations...`)
    await Promise.all(organizations.map(this._calcMigratedValue))
  }

  async _calcMigratedValue(organization: Organization): Promise<void> {
    const { address, createdAt } = organization
    logger.info(`Calculating migrated value for organization ${address}...`)

    try {
      const balances = await organization.balances()
      const values = await Promise.all(balances.map(balance => this._calcOrganizationBalanceValue(balance, createdAt)))

      const valueUSD = values.reduce((total, value) => total.add(value), decimal(0))
      const ant = await this._getAntPrice(createdAt)
      const valueANT = valueUSD.mul(ant)
      const computedAt = new Date().getTime()

      await organization.update({ valueUSD, valueANT, ant, computedAt })
    } catch (error) {
      logger.error(`Failed trying to store new organization ${address}:`, error)
    }
  }

  private async _calcOrganizationBalanceValue(balance: OrganizationBalance, createdAt: string): Promise<Decimal> {
    const asset = await Asset.findById(balance.assetId)
    const price = await this._getAssetPrice(asset!.address, createdAt)
    const value = decimal(balance.amount).mul(price)
    await balance.$query().update({ price: price.toString(), value: value.toString() })
    return value
  }

  async _getAntPrice(createdAt: string): Promise<Decimal> {
    return this._getAssetPrice(ANT_ADDRESS, createdAt)
  }

  async _getAssetPrice(address: string, createdAt: string): Promise<Decimal> {
    // TODO: fetch price from coin-gecko
    return decimal(0)
  }
}

export default new MigratedValueCalculator()
