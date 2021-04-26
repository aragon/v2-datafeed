import * as Knex from 'knex'
import Organization from '../../models/Organization'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Organization.tableName, function (table) {
    table.increments('id')
    table.string('address').notNullable()
    table.string('executor').notNullable()
    table.dateTime('createdAt').notNullable()
    table.string('valueUSD')
    table.string('valueANT')
    table.string('ant')
    table.dateTime('computedAt')
    table.unique(['address'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Organization.tableName)
}
