import fs from "node:fs";
import path from "node:path";
import { INSTALLER_DIR, ENV_FILENAME } from "../core/constants.js";
import type { SqlCredentials, MongodbCredentials } from "../core/state.types.js";

interface EnvOptions {
    database?: SqlCredentials | MongodbCredentials;
    redis?: {
        host: string;
        port: number;
        password?: string;
    };
}

function isSqlCredentials(creds: SqlCredentials | MongodbCredentials): creds is SqlCredentials {
    return "database" in creds;
}

export function writeEnvFile(options: EnvOptions) {
    const dir = path.resolve(INSTALLER_DIR);
    const file = path.join(dir, ENV_FILENAME);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const lines: string[] = [];

    if (options.database) {
        if (isSqlCredentials(options.database)) {
            lines.push(
                `POLOCLOUD_DB_HOST=${options.database.host}`,
                `POLOCLOUD_DB_PORT=${options.database.port}`,
                `POLOCLOUD_DB_USER=${options.database.username}`,
                `POLOCLOUD_DB_PASSWORD=${options.database.password}`,
                `POLOCLOUD_DB_DATABASE=${options.database.database}`,
            );
        } else {
            lines.push(
                `POLOCLOUD_DB_HOST=${options.database.host}`,
                `POLOCLOUD_DB_PORT=${options.database.port}`,
                `POLOCLOUD_DB_USER=${options.database.username}`,
                `POLOCLOUD_DB_PASSWORD=${options.database.password}`,
            );
        }
    }

    if (options.redis) {
        lines.push(
            `POLOCLOUD_REDIS_HOST=${options.redis.host}`,
            `POLOCLOUD_REDIS_PORT=${options.redis.port}`,
            `POLOCLOUD_REDIS_PASSWORD=${options.redis.password ?? ""}`,
        );
    }

    if (lines.length === 0) return;

    fs.writeFileSync(file, lines.join("\n"), "utf-8");
}