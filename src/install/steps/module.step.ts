import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../core/state.types.js";
import { Module } from "../core/enum.js";

export async function runModuleStep(state: InstallState) {
    const selectedModule = await p.select({
        message: 'Select the module you want to install:',
        options: [
            { value: Module.CLI, label: 'CLI' },
            { value: Module.NODE, label: 'NODE' },
            { value: Module.ALL, label: 'ALL' },
        ],
    });

    if (p.isCancel(selectedModule)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.module = selectedModule;
}