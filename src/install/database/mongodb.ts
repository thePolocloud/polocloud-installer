import { MongoClient } from "mongodb";
import * as p from "@clack/prompts";
import color from "picocolors";
import type { MongodbCredentials } from "../core/state.types.js";

export async function checkMongodb(
    creds: MongodbCredentials
): Promise<void> {
    const client = new MongoClient(
        `mongodb://${creds.username}:${creds.password}@${creds.host}:${creds.port}`,
        { serverSelectionTimeoutMS: 3000, authSource: "admin" }
    );

    try {
        await client.connect();
        await client.db("admin").command({ ping: 1 });
    } catch (err: any) {
        if (err.message.includes("ECONNREFUSED") || err.message.includes("connect ECONNREFUSED")) {
            p.log.error("MongoDB is not running or not reachable");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        if (err.message.includes("Authentication failed")) {
            p.log.error("Invalid MongoDB username or password");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        p.log.error("Unknown MongoDB error: " + err.message);
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    } finally {
        await client.close().catch(() => { });
    }
}
