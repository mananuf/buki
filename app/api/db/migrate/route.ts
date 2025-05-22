import { NextResponse } from 'next/server';
import knex from 'knex';
import config from '@/app/database/db.config';

const db = knex(config.production);

export async function GET() {
    try {
        await db.raw('SELECT 1+1 AS result');
        console.log('Database connection successful');
    } catch (error) {
        console.error('Database connection failed:', error);
        return NextResponse.json(
            { error: 'Database connection failed' },
            { status: 500 }
        );
    }

    try {
        await db.migrate.latest();
        return NextResponse.json({ message: 'Migrations completed successfully' });
    } catch (error) {
        console.log(error)
        return NextResponse.json(
            { error: 'Migration failed', details: error },
            { status: 500 }
        );
    }
}