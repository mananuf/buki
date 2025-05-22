import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    const users = await knex('users').select('id');
    const events = await knex('events').select('id');

    const attendees = users.flatMap((user) => {
        return events.slice(0, 3).map((event) => ({
            user_id: user.id,
            event_id: event.id,
            rsvp: faker.datatype.boolean(),
            rsvp_date: faker.date.recent(),
            created_at: new Date(),
            updated_at: new Date(),
        }));
    });

    await knex('event_attendees').insert(attendees);
}