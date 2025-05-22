import type { Knex } from 'knex';
import 'dotenv/config';

const config: { [key: string]: Knex.Config } = {
    development: {
        client: 'pg',
        connection: {
            host: process.env.PGHOST,
            user: process.env.PGUSER,
            password: process.env.PGPASSWORD,
            database: process.env.PGDATABASE,
            ssl: { rejectUnauthorized: false }
        },
        migrations: {
            directory: './migrations',
            extension: 'ts',
        },
        seeds: {
            directory: './seeders',
            extension: 'ts',
        }
    },
    production: {
        client: 'pg',
        connection: {
            connectionString: process.env.POSTGRES_URL,
            ssl: { rejectUnauthorized: false }
        },
        pool: { min: 0, max: 10 },
        migrations: {
            directory: './migrations',
            extension: 'ts',
        },
        seeds: {
            directory: './seeders',
            extension: 'ts',
        }
    }
};

export default config;