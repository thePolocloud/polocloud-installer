import fs from "node:fs";
import path from "node:path";
import { INSTALLER_DIR, ENV_FILENAME } from "../core/constants.js";

interface EnvOptions {
    database?: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    redis?: {
        host: string;
        port: number;
        password?: string;
    };
}

export function writeEnvFile(options: EnvOptions) {
    const dir = path.resolve(INSTALLER_DIR);
    const file = path.join(dir, ENV_FILENAME);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    const lines: string[] = [];

    if (options.database) {
        lines.push(
            `POLOCLOUD_DB_HOST=${options.database.host}`,
            `POLOCLOUD_DB_PORT=${options.database.port}`,
            `POLOCLOUD_DB_USER=${options.database.username}`,
            `POLOCLOUD_DB_PASSWORD=${options.database.password}`,
            `POLOCLOUD_DB_NAME=${options.database.database}`,
        );
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