import fs from "node:fs";
import path from "node:path";

const INSTALLER_DIR = ".installer";
const ENV_FILE = path.join(INSTALLER_DIR, ".env");

export function writeEnv(options: {
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
}) {
    if (!fs.existsSync(INSTALLER_DIR)) {
        fs.mkdirSync(INSTALLER_DIR, { recursive: true });
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
            `POLOCLOUD_REDIS_PASSWORD=${options.redis.password}`,
        );
    }

    fs.writeFileSync(ENV_FILE, lines.join("\n"), "utf8");
}