import fs from "fs-extra";
import path from "node:path";
import { INSTALLER_DIR, CONFIG_FILENAME } from "../core/constants.js";
import { ensureHiddenDir } from "./filesystem.js";

export async function writeConfigFile(config: unknown): Promise<void> {
  const dir = path.resolve(INSTALLER_DIR);
  const file = path.join(dir, CONFIG_FILENAME);

  await ensureHiddenDir(dir);
  await fs.writeJson(file, config, { spaces: 2 });
}