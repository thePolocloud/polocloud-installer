import type { InstallState } from "./state.types.js";

export function createInstallState(): InstallState {
  return {
    acceptedTerms: false,
    language: "en_US",
    autoStart: false,
  };
}
