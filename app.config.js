// Dynamic config: extends app.json with environment variables.
// app.config.js runs at build time — no EXPO_PUBLIC_ needed for keys used only here.
/** @param {{ config: import('@expo/config-types').ExpoConfig }} args */
export default ({ config }) => ({
  ...config,
  ios: {
    ...config.ios,
    config: {
      ...config.ios?.config,
      googleMapsApiKey: process.env.GOOGLE_MAPS_IOS_API_KEY,
    },
  },
});
