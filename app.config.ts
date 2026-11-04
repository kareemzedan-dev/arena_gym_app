import config from './app.json';
// Release builds must explicitly select the intended backend in EAS settings.
if (process.env.EAS_BUILD_PROFILE === 'production') {
  const api = process.env.EXPO_PUBLIC_API_URL;
  if (!api || !api.startsWith('https://')) throw new Error('Set EXPO_PUBLIC_API_URL to the intended HTTPS backend in the EAS production environment.');
}
export default config.expo;
