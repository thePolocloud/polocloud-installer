import fs from "node:fs";
import path from "node:path";
import { INSTALLER_DIR, CONFIG_FILENAME } from "../core/constants.js";

export function writeConfigFile(config: unknown) {
  const dir = path.resolve(INSTALLER_DIR);
  const file = path.join(dir, CONFIG_FILENAME);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(file, JSON.stringify(config, null, 2), "utf-8");
}