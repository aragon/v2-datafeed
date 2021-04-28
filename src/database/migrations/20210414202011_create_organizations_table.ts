import * as Knex from 'knex'
import Organization from '../../models/Organization'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(Organization.tableName, function (table) {
    table.increments('id')
    table.string('address').notNullable()
    table.string('executor').notNullable()
    table.dateTime('createdAt').notNullable()
    table.double('value', 10).notNullable()
    table.dateTime('syncedAt')
    table.unique(['address'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(Organization.tableName)
}
