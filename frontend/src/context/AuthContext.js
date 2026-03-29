import React, { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, getMe } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // checking stored token on mount

  // On mount: restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem("fc_token");
    if (token) {
      getMe(token)
        .then((res) => setUser(res.data.user))
        .catch(() => localStorage.removeItem("fc_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    localStorage.setItem("fc_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (name, email, password) => {
    const res = await registerUser(name, email, password);
    localStorage.setItem("fc_token", res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("fc_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
