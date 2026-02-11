import * as p from "@clack/prompts";
import color from "picocolors";
import { detectLocalDatabase } from "../../database/database-check.js";
import type { InstallState } from "../../core/state.types.js";
import { DatabaseSource, DatabaseType } from "../../core/enum.js";

export async function detectDatabase(state: InstallState) {
    const spinner = p.spinner();
    spinner.start("Checking for running database services...");

    const detected = await detectLocalDatabase();

    if (!detected.exists || !detected.port || !detected.label) {
        spinner.stop("No running database service found");
        return;
    }

    spinner.stop("Found a running database service");

    p.log.info(
        color.whiteBright(
            [
                `A service is running on port ${detected.port}.`,
                `This port is commonly used by ${detected.label}.`,
                `If this service is not a ${detected.label} Database,`,
                `or you don't want to use it, select “No”.`,
            ].join("\n")
        )
    );

    const useDetectedDb = await p.confirm({
        message: "Do you want to use this database service?",
        initialValue: true,
        active: "Yes, use this database",
        inactive: "No, configure manually",
    });

    if (p.isCancel(useDetectedDb)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    if (useDetectedDb) {
        state.database = {
            exists: true,
            type: DatabaseType.SQL, //TODO we cant say here if its sql or not when whe want to support NOSQL
            source: DatabaseSource.AUTO,
            detected: {
                host: "127.0.0.1",
                port: detected.port,
                label: detected.label,
            },
        };
    }
}
