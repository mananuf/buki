import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('event_attendees', (table) => {
        table.increments('id').primary();
        table.integer('user_id').unsigned().references('id').inTable('users');
        table.integer('event_id').unsigned().references('id').inTable('events');
        table.boolean('rsvp').defaultTo(false);
        table.timestamp('rsvp_date').nullable();
        table.timestamps(true, true);

        table.unique(['user_id', 'event_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('event_attendees');
}