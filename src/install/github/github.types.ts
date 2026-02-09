export type GitHubReleaseAsset = {
  name: string;
  browser_download_url: string;
};

export type GitHubRelease = {
  assets: GitHubReleaseAsset[];
};

export type StepContext = {
  release?: GitHubRelease;
  jarPath?: string;
};

export type Step = {
  label: string;
  run: (ctx: StepContext) => Promise<void>;
};