import { raw } from 'objection'

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
  value!: number
  createdAt!: string
  syncedAt?: string

  static create({ address, executor, createdAt }: { address: string, executor: string, createdAt: string }): Promise<Organization> {
    return this.query().insert({ address, executor, createdAt, value: 0 })
  }

  static async count(): Promise<number> {
    return this.query().resultSize()
  }

  static async totalValue(): Promise<number> {
    const results = await this.query().sum('value')
    // @ts-ignore
    return results[0].sum
  }

  static async last(): Promise<Organization | undefined> {
    return (await this.query().orderBy('createdAt', 'DESC').limit(1))[0]
  }

  static async findByAddress(address: string): Promise<Organization | undefined> {
    return this.query().findOne({ address })
  }

  async update({ value }: { value: number }): Promise<void> {
    const syncedAt = new Date().toISOString()
    await this.$query().update({ value, syncedAt })
  }
}
