export const fetchCurrentRaga = async (lat, lng, tz, clientId) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const url = `${baseUrl}/api/raga/current?lat=${lat}&lng=${lng}&tz=${tz || ''}&clientId=${clientId || ''}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Server error fetching recommendations.');
  }
  return response.json();
};
