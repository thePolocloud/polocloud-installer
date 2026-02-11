import type { InstallState } from "./install-state.js";

export function createInstallState(): InstallState {
  return {
    acceptedTerms: false,
    autoStart: false,
  };
}