// Dynamic Expo config.
//
// Expo loads the static app.json first and passes its `expo` object in here as
// `config`. Everything from app.json is kept untouched; this file adds the
// parts that must live in git (app.json is deliberately ignored) and the parts
// that differ per build profile.

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

export default ({ config }) => ({
  ...config,

  // Over-the-air updates. A JS-only fix ships straight to installed testers
  // instead of going through a new build and a new Play upload.
  updates: {
    ...config.updates,
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
    fallbackToCacheTimeout: 0,
  },

  // An update only reaches builds declaring the same runtime version. Tying it
  // to `version` means a native change is a version bump plus a real build,
  // and JS changes flow freely within that version — which is exactly the
  // boundary that matters.
  runtimeVersion: {
    policy: "appVersion",
  },

  android: {
    ...config.android,
    // Sourced from the encrypted EAS secret during cloud builds; locally the
    // env var is unset, so this falls back to the on-disk file for
    // `expo run:android` and dev.
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android.googleServicesFile,
    blockedPermissions: BLOCKED_PERMISSIONS,
  },
});
