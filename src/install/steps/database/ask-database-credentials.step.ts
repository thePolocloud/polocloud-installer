import * as p from "@clack/prompts";
import color from "picocolors";
import { DatabaseSource, DatabaseType, DatabaseName } from "../../core/enum.js";
import type { InstallState } from "../../core/state.types.js";
import { DatabaseNameSchema, HostSchema, PasswordSchema, PortSchema, UsernameSchema, zodValidate } from "../../core/prompt.validation.js";

export async function askDatabaseCredentials(state: InstallState) {
    if (!state.database?.exists) return;

    const askHostPort = state.database.source !== DatabaseSource.AUTO;
    const isNoSQL = state.database.type === DatabaseType.NOSQL;

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
                    initialValue: isNoSQL ? "27017" : "5432",
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
        ...(state.database.type === DatabaseType.SQL && {
            database: () =>
                p.text({
                    message: "Database name",
                    validate: zodValidate(DatabaseNameSchema),
                }),
        }),
    });

    if (
        p.isCancel(credentials) ||
        p.isCancel(credentials.username) ||
        p.isCancel(credentials.password) ||
        (askHostPort &&
            (p.isCancel(credentials.host) ||
                p.isCancel(credentials.port))) ||
        (state.database.type === DatabaseType.SQL &&
            p.isCancel(credentials.database))
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

    if (state.database.type === DatabaseType.SQL) {
        state.database.credentials = {
            host,
            port,
            username: credentials.username,
            password: credentials.password,
            database: credentials.database,
        };
    } else {
        state.database.credentials = {
            host,
            port,
            username: credentials.username,
            password: credentials.password,
        };
    }
}
