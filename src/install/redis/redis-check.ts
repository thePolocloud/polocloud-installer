import { Socket } from "node:net";
import { createClient } from "redis";
import * as p from "@clack/prompts";
import color from "picocolors";
import type { RedisCredentials } from "../core/state.types.js";

const COMMON_REDIS_PORT = 6379;

export async function detectRedis(): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new Socket();

        socket.setTimeout(800);

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

        socket.connect(COMMON_REDIS_PORT, "127.0.0.1");
    });
}

export async function checkRedis(creds: RedisCredentials) {
    const client = createClient({
        socket: {
            host: creds.host,
            port: creds.port,
        },
        password: creds.password,
    });

    try {
        await client.connect();
        await client.ping();
    } catch (err: any) {
        p.log.error("Redis connection failed: " + err.message);
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    } finally {
        await client.quit().catch(() => { });
    }
}