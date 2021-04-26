import { raw } from 'objection'
import { BigNumber } from 'ethers'

import { BaseModel } from '../database'
import OrganizationBalance from './OrganizationBalance'

export default class Organization extends BaseModel {
  static tableName = 'organizations'

  static relationMappings = {
    balances: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'OrganizationBalance',
      join: {
        from: 'organization.id',
        to: 'organization_balances.organizationId'
      }
    }
  }

  id!: number
  address!: string
  executor!: string
  createdAt!: string
  ant?: string
  valueUSD?: string
  valueANT?: string
  computedAt?: string

  static create({ address, executor, createdAt }: { address: string, executor: string, createdAt: string }): Promise<Organization> {
    return this.query().insert({ address, executor, createdAt })
  }

  static async count(): Promise<number> {
    return this.query().resultSize()
  }

  static async totalAntValue(): Promise<number> {
    const results = await this.query().select(raw('coalesce(sum(??), 0)', 'valueANT').as('sum'))
    // @ts-ignore
    return results[0].sum
  }

  static async last(): Promise<Organization | undefined> {
    return (await this.query().orderBy('createdAt', 'DESC').limit(1))[0]
  }

  static async findByAddress(address: string): Promise<Organization | undefined> {
    return this.query().findOne({ address })
  }

  static async withoutValue(): Promise<Organization[]> {
    return this.query().where({ value: null })
  }

  async balances(): Promise<OrganizationBalance[]> {
    return OrganizationBalance.findByOrganization(this)
  }

  async update({ valueANT, valueUSD, ant, computedAt }: { valueANT: BigNumber, valueUSD: BigNumber, ant: BigNumber, computedAt: number }): Promise<void> {
    await this.$query().update({ valueUSD: valueUSD.toString(), valueANT: valueANT.toString(), ant: ant.toString(), computedAt: computedAt.toString() })
  }
}
