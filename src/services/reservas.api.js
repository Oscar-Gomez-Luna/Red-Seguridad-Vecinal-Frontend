// src/services/reservas.api.js
import { http } from "./http";

const BASE_URL = "/Reservas";

/**
 * Servicio para consumir el backend de Reservas.
 *
 * Backend (.NET):
 *  GET    /api/Reservas
 *  GET    /api/Reservas/{id}
 *  GET    /api/Reservas/usuario/{usuarioId}
 *  POST   /api/Reservas
 *  PUT    /api/Reservas/{id}/cancelar
 *  PUT    /api/Reservas/{id}/estado
 *
 *  Además agregamos un helper para obtener usuarios
 *  con nombre completo, útil para el buscador del formulario.
 */
export const ReservasAPI = {
  /** Obtiene todas las reservas (vista administrador). */
  async getAll(signal) {
    const data = await http.get(BASE_URL, { signal });
    return data;
  },

  /** Obtiene las reservas de un usuario específico. */
  async getByUsuario(usuarioId, signal) {
    const data = await http.get(`${BASE_URL}/usuario/${usuarioId}`, { signal });
    return data;
  },

  /** Obtiene una reserva por ID. */
  async getById(id, signal) {
    const data = await http.get(`${BASE_URL}/${id}`, { signal });
    return data;
  },

  /** Crea una nueva reserva. */
  async create(body) {
    const data = await http.post(BASE_URL, body);
    return data;
  },

  /** Cancela una reserva. */
  async cancelar(id) {
    const data = await http.put(`${BASE_URL}/${id}/cancelar`);
    return data;
  },

  /** Cambia el estado de una reserva. */
  async actualizarEstado(id, estado) {
    const data = await http.put(`${BASE_URL}/${id}/estado`, { estado });
    return data;
  },

  // 🔹 Helper extra: traer usuarios listos para buscador por nombre
  async getUsuariosParaSelector(signal) {
    // Usa el endpoint de usuarios: GET /Usuarios
    const usuarios = await http.get("/Usuarios", { signal });

    return (usuarios || []).map((u) => {
      const nombreCompleto =
        u.nombreCompleto ||
        [u.nombre, u.apellidoPaterno, u.apellidoMaterno]
          .filter(Boolean)
          .join(" ");

      return {
        ...u,
        nombreCompleto,
      };
    });
  },
};

export default ReservasAPI;
