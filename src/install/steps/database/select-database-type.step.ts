import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../../install-state.js";
import { DatabaseSource, DatabaseType } from "../../install-enums.js";

export async function selectDatabaseType(state: InstallState) {
    if (state.database?.exists) return;

    const databaseType = await p.select({
        message: "Select a database type to store Node Information:",
        options: [
            {
                value: DatabaseType.SQL,
                label: "SQL (recommended)",
            },
            {
                value: DatabaseType.NOSQL,
                label: color.dim("NoSQL (coming soon)"),
                disabled: true,
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