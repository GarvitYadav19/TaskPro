import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("taskpro_user") || "null"));
  const [token, setToken] = useState(() => localStorage.getItem("taskpro_token"));

  const saveAuth = (payload) => {
    setUser(payload.user);
    setToken(payload.token);
    localStorage.setItem("taskpro_user", JSON.stringify(payload.user));
    localStorage.setItem("taskpro_token", payload.token);
  };

  const login = async (form) => {
    const { data } = await api.post("/login", form);
    saveAuth(data);
  };

  const signup = async (form) => {
    const { data } = await api.post("/signup", form);
    saveAuth(data);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("taskpro_user");
    localStorage.removeItem("taskpro_token");
  };

  const value = { user, token, login, signup, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
