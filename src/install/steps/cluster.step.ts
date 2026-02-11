import * as p from "@clack/prompts";
import color from "picocolors";
import { Module } from "../install-enums.js";
import type { InstallState } from "../install-state.js";

export async function runClusterStep(state: InstallState) {
    if (state.module !== Module.NODE && state.module !== Module.ALL) {
        return;
    }

    const cluster = await p.confirm({
        message: "Do you want to run the Node in cluster mode to share workload and enable automatic Head Node failover?",
        initialValue: false,
        active: "Yes",
        inactive: "No"
    });

    if (p.isCancel(cluster)) {
        p.outro(color.redBright("Installation cancelled."));
        process.exit(0);
    }

    state.cluster = cluster;
}