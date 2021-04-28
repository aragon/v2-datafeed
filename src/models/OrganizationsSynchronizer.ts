import { Decimal } from 'decimal.js'

import Logger from '../helpers/logger'
import { decimal, fixed } from '../helpers/numbers'

import Asset from './Asset'
import Coingecko from './Coingecko';
import Organization from './Organization'
import OrganizationBalance from './OrganizationBalance'

const logger = Logger.create('synchronizer')

// TODO: Fix this with the datetime of the first vote on Snapshot
const ORGANIZATIONS_CREATION_DEADLINE = '161943477'

class OrganizationsSynchronizer {
  async sync(): Promise<void> {
    const organizations = await this._fetchNewOrganizations()
    console.log('\n\n----------------------------------------------------')
    logger.info(`Storing ${organizations.length} new organizations...`)
    for (const organization of organizations) {
      await this._storeOrganization(organization)
    }
  }

  private async _storeOrganization(organizationData: any) {
    const { address, createdAt, executor, balances } = organizationData
    console.log('\n\n')
    logger.info(`Storing new organization ${address}...`)
    try {
      // TODO: Handle already existing DAOs
      const organization = await Organization.create({ address, executor, createdAt: new Date(createdAt * 1000).toISOString() })
      logger.success(`Stored new organization ${organization.address} with ID ${organization.id}`)
      logger.info(`Storing ${balances.length} new balances for organization ${organization.address}...`)

      let totalValue = decimal(0)
      for (const balance of balances) {
        const value = await this._storeBalance(organization, balance)
        totalValue = totalValue.add(value)
      }

      await organization.update({ value: fixed(totalValue) })
    } catch (error) {
      logger.error(`Failed to store new organization ${address}:`, error)
    }
  }

  private async _storeBalance(organization: Organization, balanceData: any): Promise<Decimal> {
    const { asset: { address, symbol, decimals }, amount } = balanceData
    try {
      logger.info(`Storing new balance ${symbol} ${amount} for organization ${organization.address}`)
      const asset = await Asset.findOrCreate({ address, symbol, decimals })
      const price = await Coingecko.getPrice(asset!.address, organization.createdAt)
      const precision = decimal(10).pow(decimals)
      const value = decimal(amount).div(precision).mul(price)
      const balance = await OrganizationBalance.create({ assetId: asset.id, organizationId: organization.id, amount, price: fixed(price), value: fixed(value) })
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
}

export default new OrganizationsSynchronizer()
