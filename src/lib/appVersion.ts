// Single source of truth for the app version shown in the UI.
// Reads package.json so the web UI and the Android versionName stay in sync.
import pkg from "../../package.json";

export const APP_VERSION = pkg.version;
