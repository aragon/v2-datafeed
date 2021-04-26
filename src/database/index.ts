import Knex from 'knex'
import { Model } from 'objection'

import config from './config'

const knex: Knex = Knex(config as Knex.Config)

knex
  .raw('select 1')
  .then(() => console.log(`Connected to database - OK`))
  .catch(error => {
    console.log(`Failed to connect to database: ${error}`)
    process.exit(1)
  })

Model.knex(knex)
export const BaseModel = Model

export default knex
