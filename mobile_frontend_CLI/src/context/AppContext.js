import React, { createContext, useState, useCallback, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { loginUser, registerUser } from '../services/authService';
import { getProfile, updateProfile } from '../services/profileService';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const AppContext = createContext({
  user: null,
  token: null,
  role: 'applicant',
  isLoading: true,
  isSignedIn: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  profile: null,
  refreshProfile: async () => {},
  saveProfile: async () => {},
  savedJobs: [],
  toggleSave: () => {},
  historyTab: 'applied',
  setHistoryTab: () => {},
});

// Turn a raw JWT into the user object the app uses (email comes from the `sub` claim),
// mirroring the web Login flow: jwtDecode(jwt) -> { id, name, accountType, profileId, sub }.
const decodeUser = (jwt) => {
  const decoded = jwtDecode(jwt);
  return { ...decoded, email: decoded.sub };
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [historyTab, setHistoryTab] = useState('applied');

  const role = user?.accountType === 'EMPLOYER' ? 'employer' : 'applicant';

  // Avoid duplicate logout calls from the 401 interceptor.
  const loggingOut = useRef(false);

  const loadProfile = useCallback(async (profileId) => {
    if (!profileId && profileId !== 0) return;
    try {
      const p = await getProfile(profileId);
      setProfile(p);
    } catch {
      // profile is best-effort; screens still work without it
    }
  }, []);

  const logout = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    } catch {}
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setProfile(null);
    setTimeout(() => {
      loggingOut.current = false;
    }, 300);
  }, []);

  // Restore session on launch.
  useEffect(() => {
    setUnauthorizedHandler(() => logout());
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const u = decodeUser(storedToken);
          setAuthToken(storedToken);
          setToken(storedToken);
          setUser(u);
          loadProfile(u.profileId);
        }
      } catch {
        await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [logout, loadProfile]);

  const login = useCallback(
    async (email, password) => {
      const data = await loginUser({ email, password }); // { jwt }
      if (!data?.jwt) throw new Error('Login failed');
      const u = decodeUser(data.jwt);
      await AsyncStorage.setItem(TOKEN_KEY, data.jwt);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(u));
      setAuthToken(data.jwt);
      setToken(data.jwt);
      setUser(u);
      loadProfile(u.profileId);
      return u;
    },
    [loadProfile]
  );

  // Register does NOT auto-login (matches web: redirect to login afterwards).
  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user?.profileId != null) await loadProfile(user.profileId);
  }, [user, loadProfile]);

  // Optimistic profile update -> PUT /profiles/update (mirrors web changeProfile).
  const saveProfile = useCallback(
    async (updated) => {
      setProfile(updated);
      try {
        const saved = await updateProfile(updated);
        setProfile(saved);
        return saved;
      } catch (e) {
        // revert by refetching the authoritative copy
        if (user?.profileId != null) loadProfile(user.profileId);
        throw e;
      }
    },
    [user, loadProfile]
  );

  const savedJobs = profile?.savedJobs || [];

  const toggleSave = useCallback(
    (jobId) => {
      if (!profile) return;
      const current = profile.savedJobs || [];
      const next = current.includes(jobId)
        ? current.filter((x) => x !== jobId)
        : [...current, jobId];
      saveProfile({ ...profile, savedJobs: next });
    },
    [profile, saveProfile]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        role,
        isLoading,
        isSignedIn: !!token,
        login,
        register,
        logout,
        profile,
        setProfile,
        refreshProfile,
        saveProfile,
        savedJobs,
        toggleSave,
        historyTab,
        setHistoryTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
