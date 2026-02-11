import * as p from "@clack/prompts";
import color from "picocolors";
import { createValidationTasks } from "./validate.task.js";
import { createDownloadTask } from "./download.task.js";
import { createConfigTask } from "./config.task.js";
import { createEnvTask } from "./env.task.js";
import type { InstallState } from "../core/state.types.js";

export async function runInstallationTasks(state: InstallState) {
    p.log.info(color.whiteBright("Start with Installing..."));

    await p.tasks([
        ...createValidationTasks(state),
        createDownloadTask(),
        createConfigTask(state),
        createEnvTask(state),
    ]);

    p.log.success(color.greenBright("Installation complete!"));
}
