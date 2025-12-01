// src/app/services/usuarios.api.js
import { http } from "./http";

const base = "/Usuarios";

export const UsuariosAPI = {
  // --- LOGIN (POST /Usuarios/login)
  login: ({ email, password }) =>
    http.post(`${base}/login`, { email, password }),

  // --- REGISTER (POST /Usuarios/register)
  register: (payload) => http.post(`${base}/register`, payload),

  // --- UPDATE (PUT /Usuarios/update)
  update: (payload) => http.put(`${base}/update`, payload),

  // --- LISTA DE USUARIOS (GET /Usuarios)
  list: () => http.get(base),

  // --- DETALLE POR ID (GET /Usuarios/{id})
  getById: (id) => http.get(`${base}/${id}`),

  // --- TIPOS DE USUARIO (GET /Usuarios/tipos-usuario)
  tipos: () => http.get(`${base}/tipos-usuario`),
};
