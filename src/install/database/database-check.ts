import { Socket } from "node:net";
import type { DetectedDatabase } from "./database.types.js";
import { checkPostgres } from "./postgres.js";
import { checkMysql } from "./mysql.js";
import { checkMongodb } from "./mongodb.js";
import { DatabaseName } from "../core/enum.js";
import type { DatabaseCredentials } from "../core/state.types.js";

const COMMON_DB_PORTS = [
    { label: "PostgreSQL", port: 5432, type: "sql" },
    { label: "MySQL or MariaDB", port: 3306, type: "sql" },
    { label: "MongoDB", port: 27017, type: "nosql" },
];

function checkPortOpen(
    port: number,
    host = "127.0.0.1",
    timeoutMs = 800
): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new Socket();

        socket.setTimeout(timeoutMs);

        socket.once("connect", () => {
            socket.destroy();
            resolve(true);
        });

        socket.once("timeout", () => {
            socket.destroy();
            resolve(false);
        });

        socket.once("error", () => {
            resolve(false);
        });

        socket.connect(port, host);
    });
}

export async function detectLocalDatabase(): Promise<DetectedDatabase> {
    for (const db of COMMON_DB_PORTS) {
        const open = await checkPortOpen(db.port);
        if (open) {
            return {
                exists: true,
                label: db.label,
                port: db.port,
                type: db.type as "sql" | "nosql",
            };
        }
    }

    return { exists: false };
}

export async function checkDatabaseCredentials(
    name: DatabaseName,
    creds: DatabaseCredentials
): Promise<void> {
    switch (name) {
        case DatabaseName.POSTGRESQL:
            await checkPostgres(creds as any);
            return;

        case DatabaseName.MYSQL:
        case DatabaseName.MARIADB:
            await checkMysql(creds as any);
            return;

        case DatabaseName.MONGODB:
            await checkMongodb(creds as any);
            return;
    }
}