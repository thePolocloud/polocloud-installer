export function formatLocaleLabel(localeCode: string): string {
    const normalized = localeCode.replace("_", "-");
    const parts = normalized.split("-");

    const lang = parts[0];
    const region = parts[1];

    if (!lang) {
        return localeCode;
    }

    const languageNames = new Intl.DisplayNames([normalized], {
        type: "language",
    });

    const regionNames = new Intl.DisplayNames([normalized], {
        type: "region",
    });

    const language = languageNames.of(lang);
    const regionName = region ? regionNames.of(region) : null;

    return regionName
        ? `${language} (${regionName})`
        : language ?? localeCode;
}