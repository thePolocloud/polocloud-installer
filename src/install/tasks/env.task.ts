import { writeEnv } from "../env-writer.js";
import type { InstallState } from "../install-state.js";

export function createEnvTask(state: InstallState) {
    return {
        title: "Writing environment variables",
        task: async () => {
            const dbCreds = state.database?.credentials;
            const redisCreds = state.redis?.credentials;

            if (!dbCreds && !redisCreds) {
                return "Writing environment variables (Skipped)";
            }

            writeEnv({
                ...(dbCreds && { database: dbCreds }),
                ...(redisCreds && { redis: redisCreds }),
            });

            return "Environment variables created";
        },
    };
}
