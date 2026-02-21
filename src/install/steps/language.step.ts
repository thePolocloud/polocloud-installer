import * as p from "@clack/prompts";
import { resolveCommonLanguages } from "../github/translations.resolver.js";
import type { InstallState } from "../core/state.types.js";
import { formatLocaleLabel } from "../utils/locale.util.js";

export async function runLanguageStep(state: InstallState) {
    const languages = await resolveCommonLanguages();

    if (languages.length === 0) {
        p.log.error("No language supported by all packs.");
        process.exit(1);
    }

    const selected = await p.select({
        message: "Select installation language",
        options: languages.map(lang => ({
            value: lang,
            label: formatLocaleLabel(lang),
        })),
    });

    if (p.isCancel(selected)) {
        p.cancel("Installation cancelled.");
        process.exit(0);
    }

    state.language = selected;
}