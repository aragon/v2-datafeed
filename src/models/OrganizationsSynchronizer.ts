import { Decimal } from 'decimal.js'

import Logger from '../helpers/logger'
import { decimal } from '../helpers/numbers'

import Asset from './Asset'
import Organization from './Organization'
import OrganizationBalance from './OrganizationBalance'

const logger = Logger.create('fetcher')

// TODO: Fix this with the datetime of the first vote on Snapshot
const ORGANIZATIONS_CREATION_DEADLINE = '161943477'

class OrganizationsSynchronizer {
  async sync(): Promise<void> {
    const organizations = await this._fetchNewOrganizations()
    logger.info(`Storing ${organizations.length} new organizations...`)
    await Promise.all(organizations.map(this._storeOrganization))
  }

  private async _storeOrganization(organizationData: any) {
    const { address, createdAt, executor, balances } = organizationData
    logger.info(`Storing new organization ${address}...`)
    try {
      const organization = await Organization.create({ address, executor, createdAt })
      logger.success(`Stored new organization ${organization.address} with ID ${organization.id}`)
      logger.info(`Storing ${balances.length} new balances for organization ${organization.address}...`)
      const values: Decimal[] = await Promise.all(balances.map((balance: any) => this._storeBalance(organization, balance)))
      const totalValue = values.reduce((total, value) => total.add(value), decimal(0))
      await organization.update({ value: totalValue.toString() })
    } catch (error) {
      logger.error(`Failed to store new organization ${address}:`, error)
    }
  }

  private async _storeBalance(organization: Organization, balanceData: any): Promise<Decimal> {
    const { asset: { address, symbol, decimals }, amount } = balanceData
    try {
      logger.success(`Storing new balance ${symbol} ${amount} for organization ${organization.address}`)
      const asset = await Asset.findOrCreate({ address, symbol, decimals })
      const price = await this._getAssetPrice(asset!.address, organization.createdAt)
      const precision = decimal(10).pow(decimals)
      const value = decimal(amount).div(precision).mul(price)
      const balance = await OrganizationBalance.create({ assetId: asset.id, organizationId: organization.id, amount, price: price.toString(), value: value.toString() })
      logger.success(`Stored balance ${symbol} ${amount} for organization ${organization.address} with ID ${balance.id}`)
      return value;
    } catch (error) {
      logger.error(`Failed to store new balance ${symbol} ${amount} for organization ${organization.address}:`, error)
      return decimal(0)
    }
  }

  private async _fetchNewOrganizations(): Promise<any[]> {
    // TODO: implement fetching new orgs from subgraph where `createdAt >= latestTimestamp`
    const last = await Organization.last()
    const latestTimestamp = last ? last.createdAt : ORGANIZATIONS_CREATION_DEADLINE
    return []
  }

  async _getAssetPrice(address: string, createdAt: string): Promise<Decimal> {
    // TODO: fetch price from coin-gecko
    return decimal(0)
  }
}

export default new OrganizationsSynchronizer()
