import { NextResponse } from 'next/server';
import knex from 'knex';
import config from '@/app/database/db.config';

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';
const db = knex(config[environment]);

export async function GET() {
    // if (process.env.NODE_ENV === 'production') {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        await db.migrate.latest();
        return NextResponse.json({ message: 'Migrations completed successfully' });
    } catch (error) {
        return NextResponse.json(
            { error: 'Migration failed', details: error },
            { status: 500 }
        );
    }
}