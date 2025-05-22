import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    const users = await knex('users').select('id');
    const events = users.map((user) => ({
        user_id: user.id,
        title: faker.lorem.words(3),
        start: faker.date.soon(),
        end: faker.date.future(),
        location: JSON.stringify({
            address: faker.location.streetAddress(),
            lat: faker.location.latitude(),
            lng: faker.location.longitude(),
        }),
        description: faker.lorem.paragraph(),
        image: faker.image.url(),
        created_at: new Date(),
        updated_at: new Date(),
    }));

    await knex('events').insert(events);
}