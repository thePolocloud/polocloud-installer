
import { detectDatabase } from "./database/detect-database.step.js";
import { selectDatabaseType } from "./database/select-database-type.step.js";
import { selectDatabaseEngine } from "./database/select-database-engine.step.js";
import { askDatabaseCredentials } from "./database/ask-database-credentials.step.js";
import type { InstallState } from "../core/state.types.js";

export async function runDatabaseStep(state: InstallState) {
    if (!state.cluster) return;

    await detectDatabase(state);
    await selectDatabaseType(state);
    await selectDatabaseEngine(state);
    await askDatabaseCredentials(state);
}