import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

/* ═══════════════════════════════════════════════════════════════════════
   CSRF TOKEN STORE
   ───────────────────────────────────────────────────────────────────────
   The backend sets a csrf_token cookie on its own origin. Because the
   frontend runs on a different origin (Vercel vs Railway), document.cookie
   on the frontend CANNOT read that cookie — browsers isolate cookies per
   origin regardless of SameSite settings.

   Instead, the backend returns the CSRF token in the JSON body of every
   auth endpoint (login / register / refresh / me). We cache it in memory
   plus sessionStorage (so it survives page reload within the same tab).
   ═══════════════════════════════════════════════════════════════════════ */
const CSRF_KEY = 'csrf_token_v1';

let csrfTokenCache = (() => {
  try {
    return sessionStorage.getItem(CSRF_KEY) || '';
  } catch {
    return '';
  }
})();

export function setCsrfToken(token) {
  csrfTokenCache = token || '';
  try {
    if (token) sessionStorage.setItem(CSRF_KEY, token);
    else sessionStorage.removeItem(CSRF_KEY);
  } catch {
    // sessionStorage blocked (private mode, cookies disabled) — memory cache still works
  }
}

export function clearCsrfToken() {
  setCsrfToken('');
}

// Attach CSRF token and (legacy) Bearer token to every request
api.interceptors.request.use((config) => {
  if (csrfTokenCache) {
    config.headers['X-CSRF-Token'] = csrfTokenCache;
  }

  // Legacy Bearer token support (used by admin panel)
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If it's a 401 and we haven't already retried, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry && error.response?.data?.code === 'TOKEN_EXPIRED') {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
          withCredentials: true,
        });

        // Server sets new accessToken cookie + CSRF cookie automatically.
        // Keep localStorage in sync for legacy admin panel.
        if (data.accessToken) {
          localStorage.setItem('token', data.accessToken);
        }
        // Capture the new CSRF token from the refresh response
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }

        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        clearCsrfToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
