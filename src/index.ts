#!/usr/bin/env node

import * as p from "@clack/prompts";
import color from "picocolors";
import { JavaCaller } from "java-caller";
import { DatabaseType, Module } from "./install/install-enums.js";
import { createInstallState } from "./install/install-state.factory.js";
import { DatabaseNameSchema, HostSchema, PasswordSchema, PortSchema, UsernameSchema, zodValidate } from "./install/install-state.js";

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
    })

    if (p.isCancel(module)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.module = module;

    /**
     * Check if the user has a database installed. If not, ask them to select a database type to store Node Information.
     */
    if (module === Module.CLI || module === Module.NODE) {
        // const dbExists = findDatabase(); //TODO find a way to check if the user has a database installed

        // state.database = {
        //     exists: dbExists,
        //     //type: dbType, //TODO find a way to check the database type
        // }
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
        })

        if (p.isCancel(database)) {
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        state.database = {
            exists: true,
            type: database,
        }
    }

    /**
     * If the user selected SQL as their database type, ask them for their database credentials.
     */
    if (state.database?.type === DatabaseType.SQL) {
        const credentials = await p.group({
            host: () =>
                p.text({
                    message: "Database host",
                    initialValue: "localhost",
                    validate: zodValidate(HostSchema),
                }),
            port: () =>
                p.text({
                    message: "Database port",
                    initialValue: "5432",
                    validate: zodValidate(PortSchema),
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

        if (p.isCancel(credentials)) {
            p.outro(color.redBright("Installation cancelled."));
            process.exit(0);
        }

        //TODO check if the credentials are valid and the database is reachable

        state.database.credentials = {
            host: credentials.host,
            port: Number(credentials.port),
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
    )

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

    //TODO create configuration file and finish installation process (download and setup files, create database if needed, etc.)
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
        )
    }

    /**
     * If the user wants to start PoloCloud, start it in a detached process so that it continues running after the installer exits.
     */
    if (state.autoStart) {
        const spinner = p.spinner();
        spinner.start("Starting PoloCloud...");

        const java = new JavaCaller({
            jar: "polocloud-launcher.jar",
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
