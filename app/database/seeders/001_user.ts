import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {
    console.log('🌱 Seeding users...');

    // Clear existing entries
    await knex('users').del();

    // Create users with hashed passwords
    const users = await Promise.all(
        Array(10).fill(null).map(async () => ({
            email: faker.internet.email(),
            password: await bcrypt.hash('password123', 10), // Hash the password
            email_verified_at: faker.datatype.boolean() ? faker.date.recent() : null,
            created_at: new Date(),
            updated_at: new Date(),
        }))
    );

    if (users.length > 0) {
        await knex('users').insert(users);
        console.log(`✅ Inserted ${users.length} users`);
    } else {
        console.log('⚠️ No users to insert');
    }
}