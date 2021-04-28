import * as Knex from 'knex'
import Asset from '../../models/Asset'
import Organization from '../../models/Organization'
import OrganizationBalance from '../../models/OrganizationBalance'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(OrganizationBalance.tableName, function (table) {
    table.increments('id')
    table.integer('assetId').index()
    table.foreign('assetId').references(`${Asset.tableName}.id`).onDelete('CASCADE')
    table.integer('organizationId').index()
    table.foreign('organizationId').references(`${Organization.tableName}.id`).onDelete('CASCADE')
    table.string('amount').notNullable()
    table.double('price', 10).notNullable()
    table.double('value', 10).notNullable()
    table.dateTime('createdAt').defaultTo(knex.fn.now()).notNullable()
    table.unique(['assetId', 'organizationId'])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(OrganizationBalance.tableName)
}
