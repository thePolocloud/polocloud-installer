import * as p from "@clack/prompts";

const OWNER = "thePolocloud";
const REPO = "polocloud-translations";
const BRANCH = "main";

type GitHubContent = {
    name: string;
    type: "file" | "dir";
};

type PackMeta = {
    name: string;
    version: string;
    defaultLanguage: string;
    languages: string[];
};

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
        headers: {
            "User-Agent": "polocloud-installer",
            "Accept": "application/vnd.github+json",
        },
    });

    if (!res.ok) {
        throw new Error(`GitHub request failed: ${res.status}`);
    }

    return res.json();
}

export async function resolveCommonLanguages(): Promise<string[]> {
    let root: GitHubContent[] = [];
    let packs: PackMeta[] = [];

    await p.tasks([
        {
            title: "Detecting translation packs",
            task: async () => {
                root = await fetchJson(
                    `https://api.github.com/repos/${OWNER}/${REPO}/contents?ref=${BRANCH}`
                );

                const packDirs = root.filter(i => i.type === "dir");

                return `${packDirs.length} translation pack${
                    packDirs.length === 1 ? "" : "s"
                } detected`;
            },
        },
        {
            title: "Loading pack metadata",
            task: async () => {
                const packDirs = root.filter(i => i.type === "dir");

                for (const dir of packDirs) {
                    try {
                        const pack = await fetchJson<PackMeta>(
                            `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${dir.name}/pack.json`
                        );

                        packs.push(pack);
                    } catch {
                        // skip folders without pack.json
                    }
                }

                return `${packs.length} pack${
                    packs.length === 1 ? "" : "s"
                } successfully loaded`;
            },
        },
    ]);

    if (packs.length === 0) {
        throw new Error("No translation packs found");
    }

    const allLanguages = packs.map(p => p.languages);

    const commonLanguages = allLanguages.reduce((acc, current) =>
        acc.filter(lang => current.includes(lang))
    );

    if (commonLanguages.length === 0) {
        throw new Error("No common language supported by all packs");
    }

    return commonLanguages;
}