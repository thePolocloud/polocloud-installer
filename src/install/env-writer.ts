import fs from "node:fs";
import path from "node:path";

const INSTALLER_DIR = ".installer";
const ENV_FILE = path.join(INSTALLER_DIR, ".env");

export function writeEnv(credentials: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
}) {
    if (!fs.existsSync(INSTALLER_DIR)) {
        fs.mkdirSync(INSTALLER_DIR, { recursive: true });
    }

    const env = [
        `POLOCLOUD_DB_HOST=${credentials.host}`,
        `POLOCLOUD_DB_PORT=${credentials.port}`,
        `POLOCLOUD_DB_USER=${credentials.username}`,
        `POLOCLOUD_DB_PASSWORD=${credentials.password}`,
        `POLOCLOUD_DB_NAME=${credentials.database}`,
    ].join("\n");

    fs.writeFileSync(ENV_FILE, env, "utf8");
}