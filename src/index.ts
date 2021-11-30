import 'reflect-metadata';
import { startServerExpress } from "./app";
require('dotenv').config();

async function main() {
    const app = await startServerExpress();
    const port = process.env.port || 4000;
    app.listen(port, () => {
        console.log("Server listening on port: ", port);
    });
}

main();