import { downloadLauncherJar } from "../github/github-download.js";

export function createDownloadTask() {
    return {
        title: "Downloading PoloCloud launcher",
        task: async (message: any) => {
            const jarPath = await downloadLauncherJar(message);
            return `Downloaded ${jarPath}`;
        },
    };
}
