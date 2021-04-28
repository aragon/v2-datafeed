import axios from 'axios'
import moment from 'moment'
import { Decimal } from 'decimal.js'

import { decimal } from '../helpers/numbers'

const BASE_URL = 'https://api.coingecko.com/api/v3'

type Coins = { [key: string]: Coin }

type Coin = {
  id: string
  name: string
  symbol: string
  address: string
}

class Coingecko {
  coins?: Coins

  async getPrice(address: string, at: string): Promise<Decimal> {
    const coins = await this.all()
    const date = moment(at).format('DD-MM-YYYY')
    const coinId = coins[address.toLowerCase()].id
    const data = await this._get(`/coins/${coinId}/history?date=${date}&localization=false`)
    const price = data?.market_data?.current_price?.usd || 0
    return decimal(price)
  }

  async all(): Promise<Coins> {
    if (this.coins == undefined) {
      this.coins = {}
      const coinsData: any[] = await this._get('coins/list?include_platform=true')
      coinsData
        .filter((coinData: any) => coinData?.platforms?.ethereum !== undefined)
        .forEach(({ id, name, symbol, platforms }: any) => {
          let address = platforms.ethereum;
          this.coins![address.toLowerCase()] = ({ id, name, symbol, address: address.toLowerCase() })
        })
    }
    return this.coins
  }

  private async _get(path: string): Promise<any> {
    const response = await axios.get(`${BASE_URL}/${path}`);
    return response.data
  }
}

export default new Coingecko()
