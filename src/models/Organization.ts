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
  migratedAt!: string
  createdAt!: string

  static create({ address, executor, migratedAt, createdAt }: { address: string, executor: string, migratedAt: string, createdAt: string }): Promise<Organization> {
    return this.query().insert({ address: address.toLowerCase(), executor, migratedAt, createdAt, value: 0 })
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
    return this.query().findOne({ address: address.toLowerCase() })
  }

  static async findByExecutor(executor: string): Promise<Organization | undefined> {
    console.log("coming for executor here ", executor);
    return this.query().findOne({ executor: executor.toLowerCase() })
  }

  async update({ value }: { value: number }): Promise<void> {
    await this.$query().update({ value })
  }
}
