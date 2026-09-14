import { useEffect, useState } from "react";
import { authApi } from "../services/api";
import { AuthContext } from "./auth-context";

const TOKEN_KEY = "acash_token";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  // `checking` is true only while we verify a stored token on first load —
  // this prevents ProtectedRoute from redirecting to /login for a split
  // second before we know whether the saved token is actually still valid.
  // Initialized based on whether a token exists at all, so we never need to
  // set it synchronously inside the effect below (only from async callbacks).
  const [checking, setChecking] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!token) {
      return;
    }

    authApi
      .me(token)
      .then((data) => setUser(data))
      .catch(() => {
        // stored token is invalid or expired — clear it and force re-login
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setChecking(false));
  }, [token]);

  const login = async (email, password) => {
    const data = await authApi.login(email, password);
    localStorage.setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  // Lets a page merge in fresh user fields (e.g. after saving avatar_config)
  // without needing to re-fetch /auth/me or reload the page.
  const updateUser = (partialUser) => {
    setUser((prev) => (prev ? { ...prev, ...partialUser } : prev));
  };

  return (
    <AuthContext.Provider value={{ user, token, checking, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
