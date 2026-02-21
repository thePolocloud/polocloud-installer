import type { InstallState } from "../core/state.types.js";
import { writeConfigFile } from "../storage/config-writer.js";

export function createConfigTask(state: InstallState) {
    return {
        title: "Creating Configuration",
        task: async () => {
            writeConfigFile({
                createdAt: new Date().toISOString(),
                language: state.language,
                module: state.module,

                database: state.database
                    ? {
                          enabled: true,
                          type: state.database.type,
                          engine: state.database.name,
                          credentialsRef: ".env",
                      }
                    : { enabled: false },

                redis: state.redis?.enabled
                    ? {
                          enabled: true,
                          credentialsRef: ".env",
                      }
                    : { enabled: false },

                cluster: state.cluster ?? false,
            });

            return "Config created";
        },
    };
}
