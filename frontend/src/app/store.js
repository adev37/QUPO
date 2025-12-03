// frontend/src/app/store.js
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { baseApi } from "../services/baseApi";

const storedAuth = (() => {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedAuth?.user || null,
    token: storedAuth?.token || null,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;

      // main storage
      localStorage.setItem("auth", JSON.stringify({ user, token }));
      // optional: backward-compat key if anything still reads qp_token
      localStorage.setItem("qp_token", token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("auth");
      localStorage.removeItem("qp_token");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
});

export const selectCurrentUser = (state) => state.auth.user;
export const selectAuthToken = (state) => state.auth.token;
