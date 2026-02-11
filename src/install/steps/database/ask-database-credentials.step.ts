import * as p from "@clack/prompts";
import color from "picocolors";
import { DatabaseSource, DatabaseType } from "../../core/enum.js";
import type { InstallState } from "../../core/state.types.js";
import { DatabaseNameSchema, HostSchema, PasswordSchema, PortSchema, UsernameSchema, zodValidate } from "../../core/prompt.validation.js";

export async function askDatabaseCredentials(state: InstallState) {
    if (state.database?.type !== DatabaseType.SQL) return;

    const askHostPort = state.database.source !== DatabaseSource.AUTO;

    const credentials = await p.group({
        ...(askHostPort && {
            host: () =>
                p.text({
                    message: "Database host",
                    initialValue: "127.0.0.1",
                    validate: zodValidate(HostSchema),
                }),
            port: () =>
                p.text({
                    message: "Database port",
                    initialValue: "5432",
                    validate: zodValidate(PortSchema),
                }),
        }),
        username: () =>
            p.text({
                message: "Database user",
                validate: zodValidate(UsernameSchema),
            }),
        password: () =>
            p.password({
                message: "Database password",
                validate: zodValidate(PasswordSchema),
            }),
        database: () =>
            p.text({
                message: "Database name",
                validate: zodValidate(DatabaseNameSchema),
            }),
    });

    if (
        p.isCancel(credentials) ||
        p.isCancel(credentials.username) ||
        p.isCancel(credentials.password) ||
        p.isCancel(credentials.database) ||
        (askHostPort &&
            (p.isCancel(credentials.host) ||
                p.isCancel(credentials.port)))
    ) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    const host =
        credentials.host ?? state.database.detected!.host;

    const port =
        credentials.port !== undefined
            ? Number(credentials.port)
            : state.database.detected!.port;

    state.database.credentials = {
        host,
        port,
        username: credentials.username,
        password: credentials.password,
        database: credentials.database,
    };
}
