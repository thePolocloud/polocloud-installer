import fs from "node:fs";
import path from "node:path";

const INSTALLER_DIR = ".installer";
const CONFIG_FILE = path.join(INSTALLER_DIR, "config.json");

export function writeInstallerConfig(config: object) {
    if (!fs.existsSync(INSTALLER_DIR)) {
        fs.mkdirSync(INSTALLER_DIR, { recursive: true });
    }

    if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
    }

    fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(config, null, 2),
        { encoding: "utf-8" }
    );
}