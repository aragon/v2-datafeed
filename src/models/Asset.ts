import { BaseModel } from '../database'

export default class Asset extends BaseModel {
  static tableName = 'assets'

  id!: number
  address!: string
  symbol!: string
  decimals!: string
  createdAt!: string

  static async findOrCreate({ address, symbol, decimals }: { address: string, symbol: string, decimals: string }): Promise<Asset> {
    const asset = await this.findByAddress(address)
    return asset ? asset : this.query().insert({ address, symbol, decimals })
  }

  static async findById(id: number): Promise<Asset | undefined> {
    return this.query().findById(id)
  }

  static async findByAddress(address: string): Promise<Asset | undefined> {
    return this.query().findOne({ address })
  }
}
