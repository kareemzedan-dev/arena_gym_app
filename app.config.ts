import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  // Expo supplies app.json here, including config overrides used by EAS/Doctor.
  if (process.env.EAS_BUILD_PROFILE === 'production') {
    const api = process.env.EXPO_PUBLIC_API_URL;
    if (!api || !api.startsWith('https://')) {
      throw new Error('Set EXPO_PUBLIC_API_URL to the intended HTTPS backend in the EAS production environment.');
    }
  }
  return { ...config, name: config.name!, slug: config.slug! };
};
