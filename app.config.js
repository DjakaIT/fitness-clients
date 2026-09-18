// Dynamic Expo config.
//
// Expo loads the static app.json first and passes its `expo` object in here as
// `config`. We keep everything from app.json untouched and only override the
// Android google-services file so it can be sourced from the encrypted EAS
// secret (GOOGLE_SERVICES_JSON) during cloud builds. Locally that env var is
// unset, so we fall back to the on-disk file for `expo run:android` / dev.
//
// google-services.json is intentionally kept out of git and delivered to the
// builder as an EAS file secret. See eas env:list.
export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    googleServicesFile:
      process.env.GOOGLE_SERVICES_JSON ?? config.android.googleServicesFile,
  },
});
