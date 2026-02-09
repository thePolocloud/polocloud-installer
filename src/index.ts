#!/usr/bin/env node

import * as p from "@clack/prompts";
import color from "picocolors";
import { JavaCaller } from "java-caller";
import { DatabaseSource, DatabaseType, Module } from "./install/install-enums.js";
import { createInstallState } from "./install/install-state.factory.js";
import { DatabaseNameSchema, HostSchema, PasswordSchema, PortSchema, UsernameSchema, zodValidate } from "./install/install-state.js";
import { writeInstallerConfig } from "./install/installer-config.js";
import { writeEnv } from "./install/env-writer.js";
import { downloadLauncherJar } from "./install/github/github-download.js";
import { detectLocalDatabase } from "./install/database/database-check.js";

const state = createInstallState();

await installPoloCloud();

async function installPoloCloud() {
    console.clear();

    p.log.info(
        color.whiteBright(
            [
                `Welcome to the ${color.bold(color.cyanBright("PoloCloud"))} Installer!`,
                `This setup will guide you through the installation and initial configuration process.`,
                `To continue, please accept the terms of service and privacy policy.`
            ].join("\n")
        )
    );

    /**
     * Check if the user accepts the terms of service and privacy policy. If not, exit the installation process.
     */
    const acceptTerms = await p.confirm({
        message: "Do you accept the terms of service and privacy policy of PoloCloud?",
        initialValue: false,
        active: "Yes, I accept",
        inactive: "No, I do not accept"
    });

    if (p.isCancel(acceptTerms) || !acceptTerms) {
        p.outro(color.redBright("Installation cancelled. You must accept the terms to proceed."));
        process.exit(0);
    }

    state.acceptedTerms = true;

    const module = await p.select({
        message: 'Select the module you want to install:',
        options: [
            { value: Module.CLI, label: 'CLI' },
            { value: Module.NODE, label: 'NODE' },
            { value: Module.ALL, label: 'ALL' },
        ],
    });

    if (p.isCancel(module)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.module = module;

    /**
     * Check if the user has a database installed. If not, ask them to select a database type to store Node Information.
     */
    if (module === Module.CLI || module === Module.NODE) {
        const spinner = p.spinner();
        spinner.start("Checking for running database services...");

        const detected = await detectLocalDatabase();

        if (detected.exists && detected.port && detected.label) {
            spinner.stop("Found a running database service");

            p.log.info(
                color.whiteBright(
                    [
                        `A service is running on port ${detected.port}.`,
                        `This port is commonly used by ${detected.label}.`,
                        `If this service is not a database,`,
                        `or you don't want to use it, select “No”.`
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
                    type: DatabaseType.SQL,
                    //TODO set type later when connection works,
                    //currently we can not verify the type (we need this when we want to support NoSQL Databases)
                    source: DatabaseSource.AUTO,
                    detected: {
                        host: "127.0.0.1",
                        port: detected.port,
                        label: detected.label,
                    }
                };
            }
        } else {
            spinner.stop("No running database service found");
        }
    }

    if (!state.database?.exists) {
        const database = await p.select({
            message: 'Select a database type to store Node Information:',
            options: [
                {
                    value: DatabaseType.SQL,
                    label: 'SQL (recommended)',
                },
                {
                    value: DatabaseType.NOSQL,
                    label: color.dim('NoSQL (coming soon)'),
                    disabled: true,
                },
            ],
        });

        if (p.isCancel(database)) {
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        state.database = {
            exists: true,
            type: database,
            source: DatabaseSource.MANUAL
        }
    }

    /**
     * If the user selected SQL as their database type, ask them for their database credentials.
     */
    if (state.database?.type === DatabaseType.SQL) {
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
        })

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
            host: host,
            port: port,
            username: credentials.username,
            password: credentials.password,
            database: credentials.database,
        }
    }

    /**
     * Ask the user if they want to start PoloCloud after the installation is complete.
     */
    p.log.warn(
        [
            'Java 21 or higher is required to run PoloCloud.',
            'If you choose automatic startup and Java is not installed,',
            'the installer will attempt to install Java 21 for you.',
        ].join('\n')
    );

    const autoStart = await p.confirm({
        message: "Do you want to start PoloCloud after the installation is complete?",
        initialValue: true,
        active: "Yes",
        inactive: "No"
    });

    if (p.isCancel(autoStart)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.autoStart = autoStart;

    p.log.info(color.whiteBright("Start with Installing..."));
    await p.tasks([
        //TODO check if the credentials are valid and the database is reachable
        {
            title: "Downloading PoloCloud launcher",
            task: async (message) => {
                const jarPath = await downloadLauncherJar(message);
                return `Downloaded ${jarPath}`;
            },
        },
        {
            title: "Creating Configuration",
            task: async () => {
                writeInstallerConfig({
                    createdAt: new Date().toISOString(),
                    module: state.module,
                    database: state.database
                        ? {
                            enabled: true,
                            type: state.database.type,
                            credentialsRef: ".env",
                        }
                        : { enabled: false },
                });

                return "Config created";
            },
        },
        {
            title: "Writing environment variables",
            task: async () => {
                if (!state.database?.credentials) {
                    return "Skipped";
                }

                writeEnv(state.database.credentials);
                return "Environment variables created";
            },
        },
    ])

    p.log.success(color.greenBright("Installation complete!"));

    /**
     * If the user does not want to start PoloCloud, show them a message with instructions on how to start it manually.
     */
    if (!state.autoStart) {
        p.log.info(
            color.whiteBright(
                [
                    `To start PoloCloud, run the following command in your terminal:`,
                    color.dim('java -jar polocloud-launcher.jar')
                ].join("\n")
            )
        );
    }

    /**
     * If the user wants to start PoloCloud, start it in a detached process so that it continues running after the installer exits.
     */
    if (state.autoStart) {
        const spinner = p.spinner();
        spinner.start("Starting PoloCloud...");

        const java = new JavaCaller({
            jar: "polocloud-launcher.jar", //TODO maybe only start if module === node because cli would not be shown here
            minimumJavaVersion: 21,
            javaType: "jdk"
        });

        await java.run(['--sleep'], { detached: true });
        spinner.stop(color.greenBright("PoloCloud is starting..."));
    }

    p.outro(
        color.whiteBright(
            [
                `Thank you for choosing PoloCloud!`,
                `   ~${color.bold(color.cyanBright("thePolocloud Team"))}`
            ].join("\n")
        )
    );
}
