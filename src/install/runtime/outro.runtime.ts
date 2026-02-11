import * as p from "@clack/prompts";
import color from "picocolors";

export function showOutro() {
    p.outro(
        color.whiteBright(
            [
                "Thank you for choosing PoloCloud!",
                `   ~${color.bold(color.cyanBright("thePolocloud Team"))}`,
            ].join("\n")
        )
    );
}