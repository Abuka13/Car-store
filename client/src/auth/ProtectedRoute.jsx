import { createContext, useContext, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  async function login(data) {
    const res = await apiLogin(data);
    setUser(res.user || res);
    return res;
  }

  async function register(data) {
    const res = await apiRegister(data);
    setUser(res.user || res);
    return res;
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuth: !!user,
        isAdmin: user?.role === "admin",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
