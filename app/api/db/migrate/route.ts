import { NextResponse } from 'next/server';
import knex from 'knex';
import config from '@/app/database/db.config';

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Initialize knex with proper TypeScript configuration
const db = knex({
    ...config[environment],
    // Override migration configuration for runtime
    migrations: {
        ...config[environment].migrations,
        // Use dynamic imports for TypeScript files
        loadExtensions: ['.ts', '.js'],
        // Disable migration validation for TypeScript
        disableMigrationsListValidation: true
    }
});

export async function GET() {
    try {
        // Test database connection
        await db.raw('SELECT 1+1 AS result');
        console.log('✅ Database connection verified');

        // Get migration status
        const [completed, pending] = await db.migrate.list();
        console.log('📋 Completed migrations:', completed);
        console.log('⏳ Pending migrations:', pending);

        if (pending.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No pending migrations',
                completed: completed.length
            });
        }

        // Run migrations one by one to handle TypeScript properly
        console.log('🚀 Starting migrations...');

        for (const migration of pending) {
            try {
                console.log(`Running migration: ${migration.file}`);

                // Dynamic import of the migration file
                const migrationPath = `@/app/database/migrations/${migration.file.replace('.ts', '')}`;
                const { up } = await import(migrationPath);

                // Check if migration is already in the database
                const exists = await db('knex_migrations')
                    .where('name', migration.file)
                    .first();

                if (!exists) {
                    // Run the migration
                    await up(db);

                    // Insert migration record
                    await db('knex_migrations').insert({
                        name: migration.file,
                        batch: completed.length + 1,
                        migration_time: new Date()
                    });

                    console.log(`✅ Completed migration: ${migration.file}`);
                } else {
                    console.log(`⏭️ Skipping already completed migration: ${migration.file}`);
                }
            } catch (migrationError) {
                console.error(`❌ Failed migration: ${migration.file}`, migrationError);
                throw migrationError;
            }
        }

        // Get final status
        const [finalCompleted] = await db.migrate.list();

        return NextResponse.json({
            success: true,
            message: 'Migrations completed successfully',
            completed: finalCompleted.length,
            migrations: finalCompleted
        });

    } catch (error) {
        console.error('❌ Migration Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Migration failed',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    } finally {
        // Clean up database connection
        await db.destroy();
    }
}