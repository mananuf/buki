import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    console.log('🌱 Seeding events...');

    // Clear existing entries
    await knex('events').del();

    // Get all users
    const users = await knex('users').select('id');

    if (users.length === 0) {
        console.log('⚠️ No users found. Please seed users first.');
        return;
    }

    console.log(`📋 Found ${users.length} users`);

    // Create multiple events per user (some users will have multiple events)
    const events = [];

    for (const user of users) {
        // Each user creates 1-3 events
        const eventCount = faker.number.int({ min: 1, max: 3 });

        for (let i = 0; i < eventCount; i++) {
            const startDate = faker.date.between({
                from: new Date(),
                to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
            });

            const endDate = new Date(startDate.getTime() + faker.number.int({ min: 1, max: 8 }) * 60 * 60 * 1000); // 1-8 hours later

            events.push({
                user_id: user.id,
                title: faker.lorem.words({ min: 2, max: 5 }),
                start: startDate,
                end: endDate,
                location: JSON.stringify({
                    address: faker.location.streetAddress(),
                    city: faker.location.city(),
                    lat: parseFloat(faker.location.latitude().toString()),
                    lng: parseFloat(faker.location.longitude().toString()),
                }),
                description: faker.lorem.paragraph(),
                image: faker.image.url(),
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
    }

    if (events.length > 0) {
        await knex('events').insert(events);
        console.log(`✅ Inserted ${events.length} events`);
    } else {
        console.log('⚠️ No events to insert');
    }
}