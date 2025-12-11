// frontend/src/hooks/useAuth.js
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectAuthToken,
  setCredentials,
  logout as logoutAction,
} from "../app/store";

export const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectCurrentUser);
  const token = useSelector(selectAuthToken);
  const isAuthenticated = !!token;

  /**
   * Login helper used by LoginPage and LoginForm.
   * Expects the full user payload from backend:
   * {
   *   _id, name, email, role,
   *   canCreateQuotation, canCreatePurchaseOrder,
   *   token
   * }
   */
  const login = useCallback(
    (userData) => {
      if (!userData) return;

      const tokenFromApi = userData.token || null;

      // Store in Redux + localStorage (authSlice does the localStorage work)
      dispatch(
        setCredentials({
          user: userData,
          token: tokenFromApi,
        })
      );

      // Go to dashboard
      navigate("/dashboard", { replace: true });
    },
    [dispatch, navigate]
  );

  const logout = useCallback(() => {
    // Clear Redux + localStorage via authSlice
    dispatch(logoutAction());

    // Go back to login
    navigate("/login", { replace: true });
  }, [dispatch, navigate]);

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
};
