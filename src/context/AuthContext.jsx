import React, { createContext, useState, useContext, useEffect } from "react";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        alert("Error", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiBaseUrl}/Usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Credenciales incorrectas");
      }

      const data = await response.json();

      const userData = {
        id: data.id,
        nombre: data.nombre,
        apellidoP: data.apellidoP,
        apellidoM: data.apellidoM,
        email,
        tipoUsuario: data.tipoUsuario,
        descripcion: data.descripcion,
        firebaseID: data.firebaseID,
        online: true,
      };

      setUser(userData);

      localStorage.setItem("user", JSON.stringify(userData));

      return true;
    } catch (error) {
      console.error("Error en login:", error);
      alert(error.message || "Error de conexión con el servidor");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
