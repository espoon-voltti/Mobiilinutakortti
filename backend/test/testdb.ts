import { DataSource } from 'typeorm';

export async function getTestDB(): Promise<DataSource> {
    const dataSource = new DataSource({
        type: 'better-sqlite3',
        database: 'test/testdb.sql',
        entities: ['src/**/*.entity{.ts,.js}'],
        synchronize: true,
        // Match the production setting in ConfigHelper.getDatabaseConnection().
        invalidWhereValuesBehavior: { null: 'ignore', undefined: 'ignore' },
    });
    return await dataSource.initialize();
}
