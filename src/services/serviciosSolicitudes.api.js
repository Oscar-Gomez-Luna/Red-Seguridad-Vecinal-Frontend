// src/services/serviciosSolicitudes.api.js
import http from "./http";

// API para SOLICITUDES de servicio
export const ServiciosSolicitudesAPI = {
  // POST /api/Servicios/solicitud
  crearSolicitudServicio(data) {
    return http.post("/api/Servicios/solicitud", data);
  },

  // GET /api/Servicios/solicitudes
  getSolicitudesServicios(signal) {
    return http.get("/api/Servicios/solicitudes", { signal });
  },

  // GET /api/Servicios/solicitud/{id}
  getSolicitudServicioById(id, signal) {
    return http.get(`/api/Servicios/solicitud/${id}`, { signal });
  },

  // GET /api/Servicios/solicitud/usuario/{usuarioId}
  getSolicitudesServicioByUsuario(usuarioId, signal) {
    return http.get(`/api/Servicios/solicitud/usuario/${usuarioId}`, {
      signal,
    });
  },

  // PUT /api/Servicios/solicitud/{id}/asignar
  asignarSolicitudServicio(id, personaAsignado) {
    return http.put(`/api/Servicios/solicitud/${id}/asignar`, {
      personaAsignado,
    });
  },

  // PUT /api/Servicios/solicitud/{id}/estado
  actualizarEstadoSolicitud(id, estado) {
    return http.put(`/api/Servicios/solicitud/${id}/estado`, { estado });
  },

  // PUT /api/Servicios/solicitud/{id}/completar
  completarSolicitudServicio(id, notasAdmin) {
    return http.put(`/api/Servicios/solicitud/${id}/completar`, {
      notasAdmin,
    });
  },
};

export default ServiciosSolicitudesAPI;
