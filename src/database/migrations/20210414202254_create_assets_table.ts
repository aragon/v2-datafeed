import * as Knex from 'knex'
import Asset from '../../models/Asset'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Asset.tableName, function (table) {
    table.increments('id')
    table.string('address').notNullable()
    table.string('symbol').notNullable()
    table.string('name').notNullable()
    table.string('decimals').notNullable()
    table.dateTime('createdAt').defaultTo(knex.fn.now()).notNullable()
    table.unique(['address'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Asset.tableName)
}
