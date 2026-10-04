import { useEffect, useState } from "react";
import { api } from "../api.js";
import { AuthContext } from "./auth.js";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem("dmi_session") || "");
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!token) return;
    api("/api/me", { token }).then(setUser).catch(() => {
      sessionStorage.removeItem("dmi_session");
      setToken("");
      setUser(null);
    });
  }, [token]);

  const remember = (accessToken, profile) => {
    sessionStorage.setItem("dmi_session", accessToken);
    setToken(accessToken);
    setUser(profile);
  };

  const logout = () => {
    sessionStorage.removeItem("dmi_session");
    setToken("");
    setUser(null);
  };

  const signIn = async (email, password, mode) => {
    const result = await api(`/api/auth/${mode}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (result.access_token) remember(result.access_token, result.user);
    return result;
  };

  const verifyEmail = async (email, code) => {
    const result = await api("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });
    remember(result.access_token, result.user);
  };

  const resendVerification = (email) => api("/api/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) });

  const exchangeOAuthTicket = async (ticket) => {
    const result = await api("/api/auth/oauth/exchange", { method: "POST", body: JSON.stringify({ ticket }) });
    remember(result.access_token, result.user);
  };

  const updateSkills = async (skills) => {
    const profile = await api("/api/me", {
      method: "PATCH", token, body: JSON.stringify({ skills }),
    });
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ token, user, signIn, verifyEmail, resendVerification, exchangeOAuthTicket, logout, updateSkills }}>
      {children}
    </AuthContext.Provider>
  );
}
