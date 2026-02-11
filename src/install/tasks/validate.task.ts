import { checkDatabaseCredentials } from "../database/database-check.js";
import { checkRedis } from "../redis/redis-check.js";
import type { InstallState } from "../install-state.js";

export function createValidationTasks(state: InstallState) {
    return [
        {
            title: "Validating database credentials",
            task: async () => {
                if (!state.cluster) {
                    return "Validating database credentials (Skipped)";
                }

                await checkDatabaseCredentials(
                    state.database!.name!,
                    state.database!.credentials!
                );

                return "Database connection successful";
            },
        },
        {
            title: "Validating Redis connection",
            task: async () => {
                if (!state.redis?.enabled) {
                    return "Validating Redis connection (Skipped)";
                }

                await checkRedis(state.redis.credentials!);
                return "Redis connection successful";
            },
        },
    ];
}
