import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/authApi.js";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreUser();
  }, []);

  const extractUser = (response) => {
    return response?.data?.data?.user ?? response?.data?.data ?? null;
  };

  const restoreUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(extractUser(response));
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (identifier, password) => {
    const response = await authApi.login(identifier, password);
    setUser(extractUser(response));
  };

  const register = async (fields) => {
    await authApi.register(fields);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
