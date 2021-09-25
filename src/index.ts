import 'reflect-metadata';
import { startServer } from './app';
import { connect } from './config/typeorm';
require('dotenv').config();

async function main() {
    connect();
    const app = await startServer();
    const port = process.env.port || 4000;
    app.listen(port, () => {
        console.log("Server listening on port: ", port);
    });
}

main();