import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../../core/state.types.js";
import { RedisSource } from "../../core/enum.js";
import { HostSchema, PasswordSchema, PortSchema, zodValidate } from "../../core/prompt.validation.js";


export async function askRedisCredentials(state: InstallState) {
    if (!state.redis?.enabled) return;

    const askHostPort = state.redis.source !== RedisSource.AUTO;

    const creds = await p.group({
        ...(askHostPort && {
            host: () =>
                p.text({
                    message: "Redis host",
                    initialValue: "127.0.0.1",
                    validate: zodValidate(HostSchema),
                }),
            port: () =>
                p.text({
                    message: "Redis port",
                    initialValue: "6379",
                    validate: zodValidate(PortSchema),
                }),
        }),
        password: () =>
            p.password({
                message: "Redis password",
                validate: zodValidate(PasswordSchema)
            }),
    });

    if (
        p.isCancel(creds) ||
        (askHostPort &&
            (p.isCancel(creds.host) ||
                p.isCancel(creds.port)))
    ) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    const host =
        creds.host ?? state.redis.detected!.host;

    const port =
        creds.port !== undefined
            ? Number(creds.port)
            : state.redis.detected!.port;

    state.redis.credentials = {
        host,
        port,
        password: creds.password,
    };
}
