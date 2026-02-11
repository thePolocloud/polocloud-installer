import * as p from "@clack/prompts";
import color from "picocolors";
import { detectRedis } from "../../redis/redis-check.js";
import { RedisSource } from "../../install-enums.js";

import type { InstallState } from "../../install-state.js";

export async function detectRedisInstance(state: InstallState) {
    const spinner = p.spinner();
    spinner.start("Checking for running Redis instance...");

    const redisDetected = await detectRedis();

    if (!redisDetected) {
        spinner.stop("No running Redis instance found");

        state.redis = {
            enabled: true,
            source: RedisSource.MANUAL,
        };

        return;
    }

    spinner.stop("Found a running Redis instance");

    p.log.info(
        color.whiteBright(
            [
                `A service is running on port 6379.`,
                `This port is commonly used by Redis.`,
                `If this service is not a Redis instance,`,
                `or you don't want to use it, select “No”.`,
            ].join("\n")
        )
    );

    const useDetectedRedis = await p.confirm({
        message: "Do you want to use this Redis instance?",
        initialValue: true,
        active: "Yes, use this Redis",
        inactive: "No, configure manually",
    });

    if (p.isCancel(useDetectedRedis)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.redis = {
        enabled: true,
        source: useDetectedRedis
            ? RedisSource.AUTO
            : RedisSource.MANUAL,
        ...(useDetectedRedis && {
            detected: {
                host: "127.0.0.1",
                port: 6379,
            },
        }),
    };
}
