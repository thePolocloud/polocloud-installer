import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../../core/state.types.js";
import { DatabaseSource, DatabaseType } from "../../core/enum.js";

export async function selectDatabaseType(state: InstallState) {
    if (state.database?.exists) return;

    const databaseType = await p.select({
        message: "Select a database type to store Node Information:",
        options: [
            {
                value: DatabaseType.SQL,
                label: "SQL (PostgreSQL, MySQL, MariaDB)",
            },
            {
                value: DatabaseType.NOSQL,
                label: "NoSQL (MongoDB)",
            },
        ],
    });

    if (p.isCancel(databaseType)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.database = {
        exists: true,
        type: databaseType,
        source: DatabaseSource.MANUAL,
    };
}