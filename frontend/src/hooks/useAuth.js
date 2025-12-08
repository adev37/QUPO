// frontend/src/hooks/useAuth.js
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const AUTH_KEY = "auth";          // <-- main key used by Redux setup
const LEGACY_TOKEN_KEY = "qp_token";
const LEGACY_USER_KEY = "qp_user";

// Helper used by baseApi & the hook
export const getStoredAuth = () => {
  // 1) New storage: { user, token } in "auth"
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        token: parsed?.token || null,
        user: parsed?.user || null,
      };
    }
  } catch {
    // ignore JSON errors
  }

  // 2) Fallback to old keys if "auth" not found
  let token = localStorage.getItem(LEGACY_TOKEN_KEY) || null;
  let user = null;
  try {
    const rawUser = localStorage.getItem(LEGACY_USER_KEY);
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch {
    user = null;
  }

  return { token, user };
};

// The main hook
export const useAuth = () => {
  const navigate = useNavigate();

  const { token, user } = useMemo(() => getStoredAuth(), []);
  const isAuthenticated = !!token;

  // Optional login helper (still works for LoginForm if you use it)
  const login = useCallback(
    (userData) => {
      if (!userData) return;
      const token = userData.token || null;

      // main key used everywhere now
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({ user: userData, token })
      );

      // legacy keys (for any old code still reading them)
      if (token) {
        localStorage.setItem(LEGACY_TOKEN_KEY, token);
      }
      localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(userData));

      navigate("/", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_USER_KEY);
    navigate("/login", { replace: true });
  }, [navigate]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
