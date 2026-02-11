import * as p from "@clack/prompts";
import color from "picocolors";
import type { InstallState } from "../install-state.js";

export async function runTermsStep(state: InstallState) {
    p.log.info(
        color.whiteBright(
            [
                `Welcome to the ${color.bold(color.cyanBright("PoloCloud"))} Installer!`,
                `This setup will guide you through the installation and initial configuration process.`,
                `To continue, please accept the terms of service and privacy policy.`
            ].join("\n")
        )
    );

    const acceptTerms = await p.confirm({
        message: "Do you accept the terms of service and privacy policy of PoloCloud?",
        initialValue: false,
        active: "Yes, I accept",
        inactive: "No, I do not accept"
    });

    if (p.isCancel(acceptTerms) || !acceptTerms) {
        p.outro(color.redBright("Installation cancelled. You must accept the terms to proceed."));
        process.exit(0);
    }

    state.acceptedTerms = true;
}