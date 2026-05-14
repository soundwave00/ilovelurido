import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied';

interface UseLocationReturn {
  location: Location.LocationObject | null;
  status: LocationStatus;
  request: () => Promise<void>;
}

export function useLocation(autoRequest = false): UseLocationReturn {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  const request = useCallback(async () => {
    setStatus('requesting');
    const { status: permStatus } = await Location.requestForegroundPermissionsAsync();
    if (permStatus !== 'granted') {
      setStatus('denied');
      return;
    }
    setStatus('granted');
    const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    setLocation(current);

    subscriptionRef.current?.remove();
    subscriptionRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, distanceInterval: 30 },
      (loc) => setLocation(loc),
    );
  }, []);

  useEffect(() => {
    if (autoRequest) {
      void request();
    }
    return () => {
      subscriptionRef.current?.remove();
    };
  }, [autoRequest, request]);

  return { location, status, request };
}
