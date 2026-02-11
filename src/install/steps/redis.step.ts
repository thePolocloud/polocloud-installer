import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../install-state.js";
import { detectRedisInstance } from "./redis/detect-redis-instance.step.js";
import { askRedisCredentials } from "./redis/ask-redis-credentials.step.js";

export async function runRedisStep(state: InstallState) {
    if (!state.cluster) return;

    const useRedis = await p.confirm({
        message: "Do you want to enable Redis for caching & cluster communication?",
        initialValue: false,
        active: "Yes",
        inactive: "No",
    });

    if (p.isCancel(useRedis)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    if (!useRedis) return;

    await detectRedisInstance(state);
    await askRedisCredentials(state);
}