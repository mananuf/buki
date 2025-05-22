import { NextResponse } from 'next/server';
import knex from 'knex';
import fs from 'fs';
import path from 'path';
import config from '@/app/database/db.config';

const environment = process.env.NODE_ENV === 'production' ? 'production' : 'development';

// Initialize knex with proper TypeScript configuration for seeds
const db = knex({
    ...config[environment],
    // Override seed configuration for runtime
    seeds: {
        ...config[environment].seeds,
        // Use dynamic imports for TypeScript files
        loadExtensions: ['.ts', '.js'],
        extension: 'ts'
    }
});

export async function GET() {
    // Uncomment if you want to restrict to development only
    // if (process.env.NODE_ENV === 'production') {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {
        // Test database connection
        await db.raw('SELECT 1+1 AS result');
        console.log('✅ Database connection verified');

        // Check if we have any seed files
        const seedDirectory = 'app/database/seeders';
        console.log(`📂 Looking for seed files in: ${seedDirectory}`);

        // Method 1: Try using Knex seed.run (may not work with TypeScript)
        try {
            console.log('🌱 Starting seeding process...');
            const result = await db.seed.run();
            console.log('✅ Seeding completed via knex.seed.run()');

            return NextResponse.json({
                success: true,
                message: 'Seeding completed successfully',
                result: result
            });
        } catch (seedError) {
            console.log('⚠️ knex.seed.run() failed, trying manual approach...', seedError);

            // Method 2: Manual seeding with dynamic imports
            const seedPath = path.join(process.cwd(), 'app/database/seeders');

            // Get all seed files
            const seedFiles = fs.readdirSync(seedPath)
                .filter((file: string) => file.endsWith('.ts') || file.endsWith('.js'))
                .sort(); // Run seeds in alphabetical order

            console.log('📋 Found seed files:', seedFiles);

            if (seedFiles.length === 0) {
                return NextResponse.json({
                    success: true,
                    message: 'No seed files found',
                    files: seedFiles
                });
            }

            // Run each seed file
            for (const seedFile of seedFiles) {
                try {
                    console.log(`🌱 Running seed: ${seedFile}`);

                    // Dynamic import of the seed file
                    const seedPath = `@/app/database/seeders/${seedFile.replace('.ts', '').replace('.js', '')}`;
                    const seedModule = await import(seedPath);

                    // Execute the seed function
                    if (seedModule.seed && typeof seedModule.seed === 'function') {
                        await seedModule.seed(db);
                        console.log(`✅ Completed seed: ${seedFile}`);
                    } else {
                        console.log(`⚠️ No seed function found in: ${seedFile}`);
                    }
                } catch (seedFileError) {
                    console.error(`❌ Failed seed: ${seedFile}`, seedFileError);
                    throw seedFileError;
                }
            }

            return NextResponse.json({
                success: true,
                message: 'Manual seeding completed successfully',
                files: seedFiles
            });
        }

    } catch (error) {
        console.error('❌ Seeding Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Seeding failed',
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