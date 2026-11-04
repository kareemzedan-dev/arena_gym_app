import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const preview = process.env.EAS_BUILD_PROFILE === 'preview';
  // Expo supplies app.json here, including config overrides used by EAS/Doctor.
  if (process.env.EAS_BUILD_PROFILE === 'production') {
    const api = process.env.EXPO_PUBLIC_API_URL;
    if (!api || !api.startsWith('https://')) {
      throw new Error('Set EXPO_PUBLIC_API_URL to the intended HTTPS backend in the EAS production environment.');
    }
  }
  return {
    ...config,
    name: preview ? 'Arena Gym Preview' : config.name!,
    slug: config.slug!,
    scheme: preview ? 'arenagym-preview' : config.scheme,
    android: {
      ...config.android,
      package: preview ? 'com.arenagym.app.preview' : config.android?.package,
    },
  };
};
