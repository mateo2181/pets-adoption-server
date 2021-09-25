import path from 'path';
import { createConnection } from 'typeorm';

export async function connect() {
    await createConnection({
        type: 'postgres',
        host: '0.0.0.0',
        port: 5432,
        username: 'root',
        password: '123456',
        database: 'pets_db',
        entities: [path.join(__dirname,'../entities/*.ts')],
        migrations: [path.join(__dirname,'../migration/*.ts')],
        cli: {
            migrationsDir: "src/migrations"
        },
        synchronize: true,
        logger: 'debug'
    })
    console.log("Database connected!");
}