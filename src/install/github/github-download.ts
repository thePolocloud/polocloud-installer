import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import type { GitHubRelease, Step, StepContext } from "./github.types.js";

const REPO = "thePolocloud/polocloud"
const JAR_NAME = "polocloud-launcher.jar";
const TARGET_JAR_PATH = path.join(process.cwd(), JAR_NAME);

async function fetchLatestRelease(): Promise<GitHubRelease> {
    const res = await fetch(
        `https://api.github.com/repos/${REPO}/releases/latest`,
        {
            headers: {
                "User-Agent": "polocloud-installer",
                "Accept": "application/vnd.github+json",
            },
        }
    );

    if (!res.ok) {
        throw new Error("Failed to fetch GitHub release");
    }

    return res.json();
}

export async function downloadLauncherJar(
    message: (text: string) => void
): Promise<string> {
    const steps: Step[] = [
        {
            label: "Fetching latest PoloCloud release",
            run: async (ctx) => {
                ctx.release = await fetchLatestRelease();
            },
        },
        {
            label: `Downloading ${JAR_NAME}`,
            run: async (ctx) => {
                if (!ctx.release) {
                    throw new Error("Release metadata missing");
                }

                const asset = ctx.release.assets.find(
                    (a) => a.name === JAR_NAME
                );

                if (!asset) {
                    throw new Error(`Release asset '${JAR_NAME}' not found`);
                }

                if (fs.existsSync(TARGET_JAR_PATH)) {
                    fs.unlinkSync(TARGET_JAR_PATH);
                }

                const res = await fetch(asset.browser_download_url);
                if (!res.ok || !res.body) {
                    throw new Error("Failed to download JAR");
                }

                await pipeline(
                    res.body,
                    fs.createWriteStream(TARGET_JAR_PATH)
                );

                ctx.jarPath = TARGET_JAR_PATH;
            },
        },
    ];

    const ctx: StepContext = {};

    for (const [index, step] of steps.entries()) {
        message(`${step.label} (${index + 1}/${steps.length})`);
        await step.run(ctx);
    }

    return ctx.jarPath!;
}