import { Socket } from "node:net";
import type { DetectedDatabase } from "./database.types.js";

const COMMON_DB_PORTS = [
    { label: "PostgreSQL", port: 5432 },
    { label: "MySQL or MariaDB ", port: 3306 },
    // { label: "MongoDB", port: 27017 }, currently we only support sql databases
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
            };
        }
    }

    return { exists: false };
}