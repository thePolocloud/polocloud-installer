import fs from "fs-extra";
import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

/**
 * Ensures a directory exists and is hidden on all operating systems.
 */
export async function ensureHiddenDir(dir: string): Promise<void> {
  await fs.ensureDir(dir);

  // On Windows, explicitly set the hidden attribute
  if (process.platform === "win32") {
    try {
      await execAsync(`attrib +h "${dir}"`);
    } catch {
      // silently ignore — hidden flag is non-critical
    }
  }
}
