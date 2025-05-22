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
        // pool: {
        //     afterCreate: function (conn: any, done: any) {
        //         done();
        //     }
        // },
        migrations: {
            directory: 'app/database/migrations',
            extension: '.ts',
            loadExtensions: ['.ts'],
            stub: './app/database/migration.stub.ts'
        },
        seeds: {
            directory: 'app/database/seeders',
            extension: 'seeder.ts',
            loadExtensions: ['.ts']
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
            directory: 'app/database/migrations',
            extension: 'ts',
            loadExtensions: ['.ts'],
            stub: './app/database/migration.stub.ts'
        },
        seeds: {
            directory: 'app/database/seeders',
            extension: 'ts',
            loadExtensions: ['.ts']
        }
    },
    pool: {

    }
};

export default config;