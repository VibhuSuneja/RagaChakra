export const fetchCurrentRaga = async (lat, lng, tz, clientId) => {
  const rawBaseUrl = import.meta.env.VITE_API_URL || '';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const url = `${baseUrl}/api/raga/current?lat=${lat}&lng=${lng}&tz=${tz || ''}&clientId=${clientId || ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Server error fetching recommendations.');
  }
  return response.json();
};
