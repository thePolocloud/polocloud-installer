#!/usr/bin/env node

import { runTermsStep } from "./install/steps/terms.step.js";
import { runModuleStep } from "./install/steps/module.step.js";
import { runClusterStep } from "./install/steps/cluster.step.js";
import { runDatabaseStep } from "./install/steps/database.step.js";
import { runRedisStep } from "./install/steps/redis.step.js";
import { runAutostartStep } from "./install/steps/autostart.step.js";
import { runInstallationTasks } from "./install/tasks/installation.task.js";
import { runAutostartExecution } from "./install/runtime/autostart.runtime.js";
import { showOutro } from "./install/runtime/outro.runtime.js";
import { createInstallState } from "./install/core/state.factory.js";
import { runLanguageStep } from "./install/steps/language.step.js";

const state = createInstallState();

await runInstaller();

async function runInstaller() {
    console.clear();

    await runTermsStep(state);
    await runLanguageStep(state);
    await runModuleStep(state);
    await runClusterStep(state);
    await runDatabaseStep(state);
    await runRedisStep(state);
    await runAutostartStep(state);

    await runInstallationTasks(state);
    await runAutostartExecution(state);

    showOutro();
}
