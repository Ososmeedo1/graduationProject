import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { storage } from '../../utils/storage';
import { APP_CONSTANTS } from '../../config/constants';

const HUB_PATH = '/hubs/admin';
let connection;
const reconnectedHandlers = new Set();

const normalizeHubBaseUrl = () => {
  const raw = String(APP_CONSTANTS.API_BASE_URL || '').trim().replace(/\/+$/, '');
  if (!raw) return '';
  if (raw.endsWith('/api')) {
    return raw.slice(0, -4);
  }
  return raw;
};

const buildHubUrl = () => {
  const baseUrl = normalizeHubBaseUrl();
  if (!baseUrl) return HUB_PATH;
  return `${baseUrl}${HUB_PATH}`;
};

const getConnection = () => {
  if (connection) return connection;

  connection = new HubConnectionBuilder()
    .withUrl(buildHubUrl(), {
      accessTokenFactory: () => storage.getToken() || '',
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();

  connection.onreconnected((connectionId) => {
    reconnectedHandlers.forEach((handler) => {
      try {
        handler(connectionId);
      } catch {
        return;
      }
    });
  });

  return connection;
};

export const startConnection = async () => {
  const hub = getConnection();
  if (hub.state === 'Connected' || hub.state === 'Connecting') return hub;

  try {
    await hub.start();
  } catch {
    return hub;
  }

  return hub;
};

export const stopConnection = async () => {
  if (!connection) return;
  const state = connection.state;
  if (state === 'Connected' || state === 'Connecting' || state === 'Reconnecting') {
    await connection.stop();
  }
};

export const on = (eventName, handler) => {
  const hub = getConnection();
  hub.on(eventName, handler);
  return () => {
    hub.off(eventName, handler);
  };
};

export const onReconnected = (handler) => {
  getConnection();
  reconnectedHandlers.add(handler);
  return () => {
    reconnectedHandlers.delete(handler);
  };
};
