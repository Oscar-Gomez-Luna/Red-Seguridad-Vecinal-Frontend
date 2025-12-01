// src/services/serviciosTipos.api.js
import http from "./http";

// API para TIPOS de servicio
export const ServiciosTiposAPI = {
  // GET /api/Servicios/tipos-servicio
  getTiposServicio(signal) {
    return http.get("/api/Servicios/tipos-servicio", { signal });
  },

  // GET /api/Servicios/tipos-servicio/{id}
  getTipoServicioById(id, signal) {
    return http.get(`/api/Servicios/tipos-servicio/${id}`, { signal });
  },
};

export default ServiciosTiposAPI;
