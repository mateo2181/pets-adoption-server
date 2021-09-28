import 'reflect-metadata';
import { startServer } from './app';
require('dotenv').config();

async function main() {
    const app = await startServer();
    const port = process.env.port || 4000;
    app.listen(port, () => {
        console.log("Server listening on port: ", port);
    });
}

main();