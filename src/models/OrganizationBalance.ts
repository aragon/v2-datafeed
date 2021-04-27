import { BaseModel } from '../database'

import Organization from './Organization'

export default class OrganizationBalance extends BaseModel {
  static tableName = 'organization_balances'

  static relationMappings = {
    organization: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Organization',
      join: {
        from: 'organization_balances.organizationId',
        to: 'organizations.id'
      },
    },
    asset: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'Asset',
      join: {
        from: 'organization_balances.assetId',
        to: 'assets.id'
      },
    },
  }

  id!: number
  assetId!: number
  organizationId!: number
  amount!: string
  price!: string
  value!: string
  createdAt!: string

  static create({ assetId, organizationId, amount, price, value }: { assetId: number, organizationId: number, amount: string, price: string, value: string }): Promise<OrganizationBalance> {
    return this.query().insert({ assetId, organizationId, amount, price, value })
  }

  static findByOrganization(organization: Organization): Promise<OrganizationBalance[]> {
    return this.query().where({ organizationId: organization.id })
  }
}
