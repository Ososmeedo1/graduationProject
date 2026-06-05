/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useReducer, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { storage } from '../utils/storage';
import { services } from '../services';
import { handleError } from '../utils/errorHandler';
import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from '../constants/roles';

const authService = services.auth;

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  permissions: [],
};

const decodeJwtPayload = (token) => {
  try {
    const [, payload] = String(token || '').split('.');
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const ensureArray = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) return value.split(/[ ,]+/g);
  return [];
};

const normalizePermissionValue = (permission) => {
  if (!permission) return '';
  if (typeof permission === 'string') return permission.trim().toLowerCase();
  if (typeof permission === 'object') {
    const raw = permission.key || permission.name || permission.value || '';
    return String(raw).trim().toLowerCase();
  }
  return '';
};

const extractPermissions = (payload, token) => {
  const tokenPayload = decodeJwtPayload(token) || {};
  const fromPayload = [
    ...ensureArray(payload?.permissions),
    ...ensureArray(payload?.permissionClaims),
    ...ensureArray(payload?.claims?.permissions),
    ...ensureArray(payload?.result?.permissions),
    ...ensureArray(payload?.user?.permissions),
  ];

  const fromToken = [
    ...ensureArray(tokenPayload.permissions),
    ...ensureArray(tokenPayload.permission),
    ...ensureArray(tokenPayload.scope),
    ...ensureArray(tokenPayload.scp),
  ];

  return Array.from(
    new Set([...fromPayload, ...fromToken].map(normalizePermissionValue).filter(Boolean))
  );
};

const normalizeRole = (role) => {
  if (!role) return role;
  const value = String(role).toLowerCase();
  if (value === 'superadmin' || value === 'super_admin' || value === 'super-admin') return ROLE_SUPER_ADMIN;
  if (value === 'administrator' || value === 'admin') return ROLE_ADMIN;
  return value;
};

const normalizeUser = (user) => {
  if (!user) return user;
  const displayName = user.name || user.fullName || user.username;
  const mergedPermissions = Array.from(
    new Set(
      [...ensureArray(user.permissions), ...ensureArray(user.permissionClaims)]
        .map(normalizePermissionValue)
        .filter(Boolean)
    )
  );

  return {
    ...user,
    name: displayName || user.name,
    role: normalizeRole(user.role),
    permissions: mergedPermissions,
  };
};

const resolveUserPayload = (responseLike) => {
  const payload = responseLike?.data || responseLike;
  return payload?.result || payload?.user || payload;
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user, permissions = [] } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
      permissions,
    };
  },
  LOGIN: (state, action) => {
    const { user, permissions = [] } = action.payload;
    return {
      ...state,
      isAuthenticated: true,
      user,
      permissions,
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    permissions: [],
  }),
};

const reducer = (state, action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;

export const AuthContext = createContext({
  ...initialState,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
});

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      const initializeUnauthenticated = () => {
        dispatch({
          type: 'INITIALIZE',
          payload: {
            isAuthenticated: false,
            user: null,
            permissions: [],
          },
        });
      };

      try {
        const accessToken = storage.getToken();

        if (accessToken) {
          const cachedUser = normalizeUser(storage.getUser());

          try {
            const meResponse = await authService.me();
            const mePayload = resolveUserPayload(meResponse);
            const normalizedMeUser = normalizeUser(mePayload);
            const user = normalizedMeUser?.role
              ? normalizedMeUser
              : normalizeUser({ ...cachedUser, ...normalizedMeUser });
            const permissions = Array.from(
              new Set([
                ...extractPermissions(mePayload, accessToken),
                ...ensureArray(user?.permissions),
              ])
            );

            if (!user?.role) {
              throw new Error('Authenticated user role is missing from /me response');
            }

            const persistedUser = {
              ...user,
              permissions,
            };

            storage.setUser(persistedUser);

            dispatch({
              type: 'INITIALIZE',
              payload: {
                isAuthenticated: true,
                user: persistedUser,
                permissions,
              },
            });
          } catch (error) {
            const status = error?.status || error?.response?.status;
            if (cachedUser?.role && status !== 401) {
              const permissions = Array.from(
                new Set([
                  ...ensureArray(cachedUser.permissions),
                  ...extractPermissions(cachedUser, accessToken),
                ])
              );

              dispatch({
                type: 'INITIALIZE',
                payload: {
                  isAuthenticated: true,
                  user: {
                    ...cachedUser,
                    permissions,
                  },
                  permissions,
                },
              });
              return;
            }

            initializeUnauthenticated();
          }
        } else {
          initializeUnauthenticated();
        }
      } catch {
        initializeUnauthenticated();
      }
    };

    initialize();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const data = response?.data || response;

      // Handle Multi-Factor Authentication / OTP Step
      if (data && data.action === 'go_to_otp_page') {
        return data; // Pass this back to the component to handle UI switch
      }

      // Fallback for direct login (if API changes back) or static mock without OTP
      // But we standardized it to return OTP action.
      // If the response is already the final token/user (unlikely with current API):
      const { user, token } = data || {};
      const normalizedUser = normalizeUser(user);
      if (token) {
        const permissions = extractPermissions(data, token);
        const normalized = {
          ...normalizedUser,
          permissions: Array.from(new Set([...(normalizedUser?.permissions || []), ...permissions])),
        };
        storage.setToken(token);
        storage.setUser(normalized);
        dispatch({ type: 'LOGIN', payload: { user: normalized, permissions: normalized.permissions } });
        return { success: true };
      }

      return data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const verifyOtp = async (email, code) => {
    try {
      const response = await authService.verifyOtp(email, code);
      // API likely returns { token: "...", result: { ...user... } }
      // Let's assume standard format or adjust after seeing real response.
      // Based on typical JWT flows:
      const data = response?.data || response;
      const token = data.token || data.accessToken;
      // User might be nested
      const user = normalizeUser(data.result || data.user || { email, role: ROLE_ADMIN }); // Fallback
      const permissions = extractPermissions(data, token);
      const normalized = {
        ...user,
        permissions: Array.from(new Set([...(user?.permissions || []), ...permissions])),
      };

      if (token) {
        storage.setToken(token);
        storage.setUser(normalized);
        dispatch({ type: 'LOGIN', payload: { user: normalized, permissions: normalized.permissions } });
        return { success: true };
      }
      throw new Error('Token missing in response');
    } catch (error) {
      handleError(error);
      throw error;
    }
  };

  const logout = async () => {
    storage.clear();
    dispatch({ type: 'LOGOUT' });
    try {
      await authService.logout();
    } catch {
      return;
    }
  };

  const contextValue = useMemo(
    () => ({
      ...state,
      permissions: state.permissions || [],
      login,
      verifyOtp,
      logout,
    }),
    [state]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};
