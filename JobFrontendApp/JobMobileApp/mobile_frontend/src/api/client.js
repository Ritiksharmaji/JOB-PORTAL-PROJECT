import axios from 'axios';
import { API_URL } from '../config';

// Single axios instance for the whole app. Mirrors the web AxiosInterceptor:
// attaches `Authorization: Bearer <jwt>` and logs the user out on 401/403.
const api = axios.create({ baseURL: API_URL });

// AuthContext sets/clears the default Authorization header on login/logout/restore.
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// AuthContext registers a handler so an expired/invalid token forces a logout,
// exactly like the web interceptor dispatching removeUser()/removeJwt().
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if ((status === 401 || status === 403) && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

// Backend returns errors as { errorMessage, errorCode, timeStamp } (HTTP 400/500).
// Helper to surface a readable message in the UI.
export const errMessage = (error) =>
  error?.response?.data?.errorMessage ||
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.';

export default api;
