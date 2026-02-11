import * as p from "@clack/prompts";
import color from "picocolors";
import { JavaCaller } from "java-caller";
import type { InstallState } from "../core/state.types.js";

export async function runAutostartExecution(state: InstallState) {
    if (!state.autoStart) {
        p.log.info(
            color.whiteBright(
                [
                    "To start PoloCloud, run the following command in your terminal:",
                    color.dim("java -jar polocloud-launcher.jar"),
                ].join("\n")
            )
        );
        return;
    }

    const spinner = p.spinner();
    spinner.start("Starting PoloCloud...");

    const java = new JavaCaller({
        jar: "polocloud-launcher.jar",
        minimumJavaVersion: 21,
        javaType: "jdk",
    });

    await java.run(["--sleep"], { detached: true });

    spinner.stop(color.greenBright("PoloCloud is starting..."));
}
