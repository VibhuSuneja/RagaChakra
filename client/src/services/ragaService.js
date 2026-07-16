export const fetchCurrentRaga = async (lat, lng, tz, clientId) => {
  const response = await fetch(`/api/raga/current?lat=${lat}&lng=${lng}&tz=${tz}&clientId=${clientId}`);
  if (!response.ok) {
    throw new Error('Server error fetching recommendations.');
  }
  return response.json();
};
