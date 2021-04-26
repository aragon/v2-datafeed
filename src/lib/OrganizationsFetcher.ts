import Logger from '../helpers/logger'

import Asset from '../models/Asset'
import Organization from '../models/Organization'
import OrganizationBalance from '../models/OrganizationBalance'

const logger = Logger.create('fetcher')

// TODO: Fix this with the datetime of the first vote on Snapshot
const ORGANIZATIONS_CREATION_DEADLINE = '161943477'

class OrganizationsFetcher {
  async call(): Promise<void> {
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
      await Promise.all(balances.map((balance :any) => this._storeBalance(organization, balance)))
    } catch (error) {
      logger.error(`Failed to store new organization ${address}:`, error)
    }
  }

  private async _storeBalance(organization: Organization, balanceData: any): Promise<void> {
    const { asset: { address, symbol }, amount } = balanceData
    try {
      logger.success(`Storing new balance ${symbol} ${amount} for organization ${organization.address}`)
      const asset = await Asset.findOrCreate({ address, symbol })
      const balance = await OrganizationBalance.create({ assetId: asset.id, organizationId: organization.id, amount })
      logger.success(`Stored balance ${symbol} ${amount} for organization ${organization.address} with ID ${balance.id}`)
    } catch (error) {
      logger.error(`Failed to store new balance ${symbol} ${amount} for organization ${organization.address}:`, error)
    }
  }

  private async _fetchNewOrganizations(): Promise<any[]> {
    // TODO: implement fetching new orgs from subgraph where `createdAt >= latestTimestamp`
    const last = await Organization.last()
    const latestTimestamp = last ? last.createdAt : ORGANIZATIONS_CREATION_DEADLINE
    return []
  }
}

export default new OrganizationsFetcher()
