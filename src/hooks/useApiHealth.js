import { useEffect, useMemo, useState } from 'react';
import axios from '../services/api/axios';

const HEARTBEAT_INTERVAL_MS = 30000;

const isOnlineByStatus = (status) => {
  const code = Number(status || 0);
  return code > 0;
};

const useApiHealth = () => {
  const [connected, setConnected] = useState(true);
  const [lastCheckedAt, setLastCheckedAt] = useState(() => Date.now());

  useEffect(() => {
    const onStatus = (event) => {
      const nextConnected = Boolean(event?.detail?.connected);
      const timestamp = Number(event?.detail?.timestamp || Date.now());
      setConnected(nextConnected);
      setLastCheckedAt(timestamp);
    };

    window.addEventListener('api:status', onStatus);
    return () => window.removeEventListener('api:status', onStatus);
  }, []);

  useEffect(() => {
    let mounted = true;

    const heartbeat = async () => {
      try {
        await axios.get('/admin/dashboard/stats', {
          timeout: 5000,
          headers: {
            'X-Heartbeat': '1',
          },
        });

        if (mounted) {
          setConnected(true);
          setLastCheckedAt(Date.now());
        }
      } catch (error) {
        const status = error?.status || error?.response?.status;
        if (mounted) {
          setConnected(isOnlineByStatus(status));
          setLastCheckedAt(Date.now());
        }
      }
    };

    heartbeat();
    const timer = setInterval(heartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return useMemo(
    () => ({
      connected,
      lastCheckedAt,
    }),
    [connected, lastCheckedAt]
  );
};

export default useApiHealth;
