import { Decimal } from 'decimal.js'
import { request } from 'graphql-request'

import Logger from '../helpers/logger'
import { decimal, fixed } from '../helpers/numbers'

import Asset from './Asset'
import Coingecko from './Coingecko';
import Organization from './Organization'
import OrganizationBalance from './OrganizationBalance'

const logger = Logger.create('synchronizer')

// TODO: Fix this with the datetime of the first vote on Snapshot
const ORGANIZATIONS_CREATION_DEADLINE = '1621006988' // which is 2021-05-14T15:43:08Z

const SUBGRAPH_URL: { [key: string]: string } = {
  rinkeby: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-migrator-rinkeby',
  staging: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-migrator-rinkeby-staging',
  mainnet: 'https://api.thegraph.com/subgraphs/name/aragon/aragon-migrator-mainnet'
}

class OrganizationsSynchronizer {
  async sync(): Promise<void> {
    const organizations = await this._fetchOrganizations()
    console.log('\n\n----------------------------------------------------')
    logger.info(`Storing ${organizations.length} new organizations...`)
    for (const organization of organizations) {
      await this._storeOrganization(organization)
    }
  }

  private async _storeOrganization(organizationData: any) {
    const { address, migratedAt, createdAt, executor, balances } = organizationData
    console.log('\n\n')
    logger.info(`Storing new organizationnn ${address}...`)

     /**
     * The Problem might arise for a) and b) because the current solution doesn't encounter for this.
     * a) the two different organizations try to migrate to the same executor
     *     org1 - exec1
     *     org2 - exec1
     * b) the same organization tries to migrate to the different executors.
     *     org1 - exec1
     *     org1 - exec2
     * c) all organizations try to migrate to different executors
     *     org1 - exec1
     *     org2 - exec2
     */

    try {
      let organization = await Organization.findByAddress(address)
      if (organization) {
        // If there was a second migration it's being ignored, only the first one counts
        logger.info(`Found already existing organizationn ${organization.address} with ID ${organization.id}`)
      } else {
        organization = await Organization.create({ address, executor, migratedAt: new Date(migratedAt * 1000).toISOString(), createdAt: new Date(createdAt * 1000).toISOString() })
        logger.success(`Stored new organizationn ${organization.address} with ID ${organization.id}`)
        logger.info(`Storing ${balances.length} new balances for organization ${organization.address}...`)
      }

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
    const { token: { id: address, symbol, decimals }, amount } = balanceData
    logger.info(`Storing new balance ${symbol} ${amount} for organization ${organization.address}`)

    try {
      const asset = await Asset.findOrCreate({ address, symbol, decimals })
      if (!asset) throw Error(`Failed trying to find-or-create asset ${symbol} ${address}`)

      let price = decimal(0), 
          value = decimal(0);
        
      if(process.env.NETWORK === 'mainnet') {
        price = await Coingecko.getPrice(asset.address, organization.createdAt)
        const precision = decimal(10).pow(decimals)
        value = decimal(amount).div(precision).mul(price) 
      }

      let balance = await OrganizationBalance.findByOrganizationAndAsset(organization, asset)
      if (balance) {
        await balance.update({ amount, price: fixed(price), value: fixed(value) })
        logger.success(`Updated already existing balance ${symbol} ${amount} for organization ${organization.address} with ID ${balance.id}`)
      } else {
        balance = await OrganizationBalance.create({ assetId: asset.id, organizationId: organization.id, amount, price: fixed(price), value: fixed(value) })
        logger.success(`Stored balance ${symbol} ${amount} for organization ${organization.address} with ID ${balance.id}`)
      }

      return value;
    } catch (error) {
      logger.error(`Failed to store new balance ${symbol} ${amount} for organization ${organization.address}:`, error)
      return decimal(0)
    }
  }

  private async _fetchOrganizations(): Promise<any[]> {
    const network = process.env.NETWORK
    if (!network) throw Error('You must define a network through ENV')

    const url = SUBGRAPH_URL[network]
    if (!url) throw Error(`Unknown network ${network}`)

    const last = await Organization.last()
    const latestTimestamp = (last ? Number(last.migratedAt) : 0) / 1000

    const result = await request(url, `{
      migrations (where: { executed: true, executedAt_gte: ${latestTimestamp}, daoCreatedAt_lte: ${ORGANIZATIONS_CREATION_DEADLINE} }, orderBy: createdAt) {
        executedAt
        voting {
          dao {
            id
            createdAt
          }
        }
        executor {
          id
        }
        assets {
          amount
          token {
            id
            symbol
            decimals
          }
        }
      }
    }`)

    return result.migrations.map(({ executedAt, executor, voting: { dao }, assets }: any) => {
      return {
        migratedAt: executedAt,
        executor: executor.id,
        address: dao.id,
        createdAt: dao.createdAt,
        balances: assets
      }
    })
  }
}

export default new OrganizationsSynchronizer()
