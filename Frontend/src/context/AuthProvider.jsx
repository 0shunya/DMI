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
    remember(result.access_token, result.user);
  };

  const updateSkills = async (skills) => {
    const profile = await api("/api/me", {
      method: "PATCH", token, body: JSON.stringify({ skills }),
    });
    setUser(profile);
  };

  return (
    <AuthContext.Provider value={{ token, user, signIn, logout, updateSkills }}>
      {children}
    </AuthContext.Provider>
  );
}
