// frontend/src/hooks/useAuth.js
import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = "qp_token";
const USER_KEY = "qp_user";

// Helper used by baseApi & the hook
export const getStoredAuth = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);

  let user = null;
  try {
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

  const login = useCallback(
    (userData) => {
      if (userData?.token) {
        localStorage.setItem(TOKEN_KEY, userData.token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      navigate("/", { replace: true });
    },
    [navigate]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
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

// ⛔ NO default export here
// export default useAuth;
