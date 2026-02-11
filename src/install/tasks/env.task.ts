import type { InstallState } from "../core/state.types.js";
import { writeEnvFile } from "../storage/env-writer.js";


export function createEnvTask(state: InstallState) {
    return {
        title: "Writing environment variables",
        task: async () => {
            const dbCreds = state.database?.credentials;
            const redisCreds = state.redis?.credentials;

            if (!dbCreds && !redisCreds) {
                return "Writing environment variables (Skipped)";
            }

            writeEnvFile({
                ...(dbCreds && { database: dbCreds }),
                ...(redisCreds && { redis: redisCreds }),
            });

            return "Environment variables created";
        },
    };
}
