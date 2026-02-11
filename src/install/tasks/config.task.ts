import { writeInstallerConfig } from "../installer-config.js";
import type { InstallState } from "../install-state.js";

export function createConfigTask(state: InstallState) {
    return {
        title: "Creating Configuration",
        task: async () => {
            writeInstallerConfig({
                createdAt: new Date().toISOString(),
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
