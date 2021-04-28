import { Decimal } from 'decimal.js'

export const decimal = (x: string | number): Decimal => new Decimal(x)

export const fixed = (x: Decimal): number => Number(x.toFixed(10, Decimal.ROUND_DOWN))
