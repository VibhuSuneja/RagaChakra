export const getApiUrl = () => {
  // If VITE_API_URL is set (e.g. on Vercel), use it. Otherwise default to empty string for relative paths
  return import.meta.env.VITE_API_URL || '';
};
