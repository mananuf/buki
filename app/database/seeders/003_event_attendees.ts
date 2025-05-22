import type { Knex } from 'knex';
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    console.log('🌱 Seeding event attendees...');

    // Clear existing entries
    await knex('event_attendees').del();

    // Get all users and events
    const users = await knex('users').select('id');
    const events = await knex('events').select('id');

    if (users.length === 0) {
        console.log('⚠️ No users found. Please seed users first.');
        return;
    }

    if (events.length === 0) {
        console.log('⚠️ No events found. Please seed events first.');
        return;
    }

    console.log(`📋 Found ${users.length} users and ${events.length} events`);

    const attendees = [];
    const addedCombinations = new Set(); // Track unique user-event combinations

    // Create realistic attendee relationships
    for (const user of users) {
        // Each user attends 2-5 random events
        const eventCount = faker.number.int({ min: 2, max: Math.min(5, events.length) });
        const shuffledEvents = faker.helpers.shuffle([...events]);

        for (let i = 0; i < eventCount; i++) {
            const event = shuffledEvents[i];
            const combination = `${user.id}-${event.id}`;

            // Avoid duplicates (though we have unique constraint)
            if (!addedCombinations.has(combination)) {
                addedCombinations.add(combination);

                const rsvp = faker.datatype.boolean(0.7); // 70% chance of RSVP

                attendees.push({
                    user_id: user.id,
                    event_id: event.id,
                    rsvp: rsvp,
                    rsvp_date: rsvp ? faker.date.recent({ days: 7 }) : null,
                    created_at: new Date(),
                    updated_at: new Date(),
                });
            }
        }
    }

    if (attendees.length > 0) {
        try {
            await knex('event_attendees').insert(attendees);
            console.log(`✅ Inserted ${attendees.length} event attendees`);
        } catch (error) {
            console.error('❌ Error inserting attendees:', error);
            throw error;
        }
    } else {
        console.log('⚠️ No event attendees to insert');
    }
}