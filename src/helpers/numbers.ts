import { BigNumber } from 'ethers'

export type BigNumberish = string | number | BigNumber

export const bn = (x: BigNumberish): BigNumber => BigNumber.from(x)
