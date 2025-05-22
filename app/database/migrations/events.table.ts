import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users');
        table.string('title').unique().notNullable();
        table.timestamp('start').notNullable();
        table.timestamp('end').notNullable();
        table.jsonb('location').notNullable();
        table.text('description');
        table.string('image');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('events');
}