import { Decimal } from 'decimal.js'

export const decimal = (x: string | number): Decimal => new Decimal(x)
