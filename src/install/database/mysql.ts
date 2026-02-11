import mysql from "mysql2/promise";
import * as p from "@clack/prompts";
import color from "picocolors";
import type { DatabaseCredentials } from "../install-state.js";

export async function checkMysql(
    creds: DatabaseCredentials
): Promise<void> {
    let connection;

    try {
        connection = await mysql.createConnection({
            host: creds.host,
            port: creds.port,
            user: creds.username,
            password: creds.password,
            database: creds.database,
            connectTimeout: 3000,
        });

        await connection.query("SELECT 1");

    } catch (err: any) {
        if (err.code === "ECONNREFUSED") {
            p.log.error("MySQL/MariaDB is not running or not reachable");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        if (err.code === "ER_ACCESS_DENIED_ERROR") {
            p.log.error("Invalid MySQL/MariaDB username or password");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        if (err.code === "ER_BAD_DB_ERROR") {
            p.log.error("Database does not exist");
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        p.log.error("Unknown MySQL/MariaDB error: " + err.message);
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    } finally {
        if (connection) {
            await connection.end().catch(() => { });
        }
    }
}