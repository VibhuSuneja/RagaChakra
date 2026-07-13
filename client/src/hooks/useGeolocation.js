import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [state, setState] = useState({
    loading: true,
    coordinates: null,
    error: null,
    timezone: null,
  });

  useEffect(() => {
    let active = true;

    const fallbackToIP = async (err) => {
      console.warn('Geolocation failed or timed out. Falling back to IP-based lookup:', err);
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
          throw new Error('IP API lookup failed');
        }
        const data = await response.json();
        if (active) {
          setState({
            loading: false,
            coordinates: { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) },
            timezone: data.timezone,
            error: null,
          });
        }
      } catch (ipErr) {
        console.error('IP Geolocation fallback failed:', ipErr);
        if (active) {
          setState({
            loading: false,
            coordinates: { lat: 28.6139, lng: 77.2090 }, // Delhi fallback
            timezone: 'Asia/Kolkata',
            error: 'Failed to get location, using default location (New Delhi)',
          });
        }
      }
    };

    if (!navigator.geolocation) {
      fallbackToIP('Geolocation not supported by browser');
      return;
    }

    const geoTimeout = setTimeout(() => {
      fallbackToIP('Geolocation request timed out');
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        clearTimeout(geoTimeout);
        if (active) {
          setState({
            loading: false,
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
            error: null,
          });
        }
      },
      (error) => {
        clearTimeout(geoTimeout);
        fallbackToIP(error.message);
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );

    return () => {
      active = false;
      clearTimeout(geoTimeout);
    };
  }, []);

  return state;
}
