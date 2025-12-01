import { create } from "zustand";

export const useAuth = create((set) => ({
  user: null, // { id, nombre, tipoUsuarioId, token }
  isAuth: false,
  login: (user) => set({ user, isAuth: true }),
  logout: () => set({ user: null, isAuth: false }),
}));
