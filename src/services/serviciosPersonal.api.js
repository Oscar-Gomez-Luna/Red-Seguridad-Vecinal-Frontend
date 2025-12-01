// src/services/serviciosPersonal.api.js
import { http } from "./http";

// Prefijo para PERSONAL de mantenimiento
const BASE_URL = "/Servicios/personal-mantenimiento";

export const ServiciosPersonalAPI = {
  // GET /api/Servicios/personal-mantenimiento
  getPersonalMantenimiento(signal) {
    return http.get(BASE_URL, { signal });
  },

  // GET /api/Servicios/personal-mantenimiento/{id}
  getPersonalMantenimientoById(id, signal) {
    return http.get(`${BASE_URL}/${id}`, { signal });
  },

  // POST /api/Servicios/personal-mantenimiento
  crearPersonalMantenimiento(data) {
    return http.post(BASE_URL, data);
  },

  // Helper extra: personas/usuarios listos para buscador (por nombre/correo)
  async getPersonasParaSelector(signal) {
    // Igual que en Reservas: usamos el endpoint de usuarios
    // GET /api/Usuarios
    const usuarios = await http.get("/Usuarios", { signal });

    return (usuarios || []).map((u) => {
      const nombreCompleto =
        u.nombreCompleto ||
        [u.nombre, u.apellidoPaterno, u.apellidoMaterno]
          .filter(Boolean)
          .join(" ");

      return {
        // personaID será el que uses en la FK de personalMantenimiento
        personaID: u.personaID ?? u.usuarioID,
        nombreCompleto,
        emailPersona: u.emailPersona || u.email || null,
        telefonoPersona: u.telefonoPersona || u.telefono || null,
      };
    });
  },
};

export default ServiciosPersonalAPI;
