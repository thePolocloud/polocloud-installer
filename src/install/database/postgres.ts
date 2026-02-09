import pg from "pg";
import * as p from "@clack/prompts";
import color from "picocolors";
import type { DatabaseCredentials } from "../install-state.js";

const { Client } = pg;

export async function checkPostgres(
    creds: DatabaseCredentials
): Promise<void> {
    const client = new Client({
        host: creds.host,
        port: creds.port,
        user: creds.username,
        password: creds.password,
        database: creds.database,
        connectionTimeoutMillis: 3000,
    });

    try {
        await client.connect();
        await client.query("SELECT 1");
    } catch (err: any) {
        if (err.code === "ECONNREFUSED") {
            p.log.error("PostgreSQL is not running or not reachable");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }
        if (err.code === "28P01") {
            p.log.error("Invalid PostgreSQL username or password");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }
        if (err.code === "3D000") {
            p.log.error("Database does not exist");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }
    } finally {
        await client.end().catch(() => { });
    }
}