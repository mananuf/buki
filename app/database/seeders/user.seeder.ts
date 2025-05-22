import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    const users = Array(10).fill(null).map(() => ({
        email: faker.internet.email(),
        password: faker.internet.password(),
        created_at: new Date(),
        updated_at: new Date(),
    }));

    await knex('users').insert(users);
}