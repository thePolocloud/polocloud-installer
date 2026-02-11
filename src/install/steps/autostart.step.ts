import * as p from "@clack/prompts";
import color from "picocolors";
import { Module } from "../install-enums.js";
import type { InstallState } from "../install-state.js";

export async function runAutostartStep(state: InstallState) {
    p.log.warn(
        [
            "Java 21 or higher is required to run PoloCloud.",
            "If you choose automatic startup and Java is not installed,",
            "the installer will attempt to install Java 21 for you.",
        ].join("\n")
    );

    if (state.module !== Module.NODE) return;

    const autoStart = await p.confirm({
        message: "Do you want to start PoloCloud after the installation is complete?",
        initialValue: true,
        active: "Yes",
        inactive: "No",
    });

    if (p.isCancel(autoStart)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.autoStart = autoStart;
}
