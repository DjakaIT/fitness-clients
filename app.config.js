// Dynamic Expo config.
//
// Expo loads the static app.json first and passes its `expo` object in here as
// `config`. Everything from app.json is kept untouched; this file adds the
// parts that differ per build profile.

const EAS_PROJECT_ID = "6930a400-30e0-4a10-8290-711602455a82";

// EAS sets this during a cloud build; it is undefined for local `expo start`.
const profile = process.env.EAS_BUILD_PROFILE;
const isDevelopmentBuild = !profile || profile === "development";

/**
 * Permissions the app does not use, dropped from the merged manifest.
 *
 * They arrive from libraries' own manifests, not from our code. Shipping
 * SYSTEM_ALERT_WINDOW ("draw over other apps") in particular is a policy-
 * sensitive permission on Play and alarming to anyone who reads the listing.
 *
 * SYSTEM_ALERT_WINDOW is left in place for development builds, where React
 * Native's dev menu can use it.
 */
const BLOCKED_PERMISSIONS = [
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.WRITE_EXTERNAL_STORAGE",
  "android.permission.VIBRATE",
  ...(isDevelopmentBuild ? [] : ["android.permission.SYSTEM_ALERT_WINDOW"]),
];

/**
 * Where prebuild should read google-services.json from.
 *
 * On EAS this must be a **file** secret: EAS writes the file and sets the env
 * var to its path. Created as a plain string secret instead, the variable holds
 * the JSON itself, prebuild treats that blob as a filename, and the build dies
 * in the prebuild phase with nothing useful in the log. Catch it here, where we
 * can say which mistake it is.
 */
function googleServicesPath(config) {
  const fromEnv = process.env.GOOGLE_SERVICES_JSON;
  if (!fromEnv) return config.android.googleServicesFile;

  if (fromEnv.trimStart().startsWith("{")) {
    throw new Error(
      "GOOGLE_SERVICES_JSON holds JSON content, not a path.\n" +
        "On EAS it has to be a file-type variable. Recreate it with:\n" +
        "  eas env:delete production --variable-name GOOGLE_SERVICES_JSON\n" +
        "  eas env:create production --name GOOGLE_SERVICES_JSON \\\n" +
        "    --type file --value ./google-services.json --visibility secret",
    );
  }

  return fromEnv;
}

export default ({ config }) => {
  // app.json carries the app's identity: name, package, plugins, EAS project
  // id. EAS uploads the project through git, so if app.json ever stops being
  // tracked the builder receives an empty config and the build dies in the
  // prebuild phase with an unexplained error. Say so instead.
  if (!config?.android?.package) {
    throw new Error(
      "Expo config is missing app.json (no android.package resolved).\n" +
        "app.json must be committed — EAS builds from git, and without it the " +
        "build has no plugins and no Google sign-in.",
    );
  }

  return {
    ...config,

    // Android is what this app ships. Without this key Expo defaults to
    // android + ios + web, and `eas update` / `expo export` bundle all three —
    // which fails, because the web build of react-native-youtube-iframe needs
    // react-native-web-webview and that has never been a dependency here. The
    // web target has never worked; this stops it being bundled as if it did.
    // Adding a platform back is this line plus its missing dependencies.
    platforms: ["android"],

    // Over-the-air updates. A JS-only fix ships straight to installed testers
    // instead of going through a new build and a new Play upload.
    updates: {
      ...config.updates,
      url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
      fallbackToCacheTimeout: 0,
    },

    // An update only reaches builds declaring the same runtime version. Tying
    // it to `version` means a native change is a version bump plus a real
    // build, and JS changes flow freely within that version — which is exactly
    // the boundary that matters.
    runtimeVersion: {
      policy: "appVersion",
    },

    android: {
      ...config.android,
      // Sourced from the encrypted EAS secret during cloud builds; locally the
      // env var is unset, so this falls back to the on-disk file for
      // `expo run:android` and dev.
      googleServicesFile: googleServicesPath(config),
      blockedPermissions: BLOCKED_PERMISSIONS,
    },
  };
};
