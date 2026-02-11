import * as p from "@clack/prompts";
import color from "picocolors";
import { DatabaseName } from "../../install-enums.js";

import type { InstallState } from "../../install-state.js";

export async function selectDatabaseEngine(state: InstallState) {
    if (!state.database?.exists) return;

    let databaseName: DatabaseName;

    if (state.database.detected?.port === 5432) {
        databaseName = DatabaseName.POSTGRESQL;
    } else {
        const options =
            state.database.detected?.port === 3306
                ? [
                      { value: DatabaseName.MYSQL, label: "MySQL" },
                      { value: DatabaseName.MARIADB, label: "MariaDB" },
                  ]
                : [
                      { value: DatabaseName.POSTGRESQL, label: "PostgreSQL (recommended)" },
                      { value: DatabaseName.MYSQL, label: "MySQL" },
                      { value: DatabaseName.MARIADB, label: "MariaDB" },
                  ];

        const result = await p.select({
            message: state.database.detected
                ? "Which database engine is running?"
                : "Which database do you want to use?",
            options,
        });

        if (p.isCancel(result)) {
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        databaseName = result;
    }

    state.database.name = databaseName;
}
