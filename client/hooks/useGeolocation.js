import { useState, useEffect } from 'react';

export default function useGeolocation() {
  const [state, setState] = useState({
    loading: false,
    coordinates: { lat: 28.6139, lng: 77.2090 },
    error: null
  });

  return state;
}
