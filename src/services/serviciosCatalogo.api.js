// src/services/serviciosCatalogo.api.js
import http from "./http";

// API para el CATÁLOGO de servicios
export const ServiciosCatalogoAPI = {
  // ============================================
  // CATÁLOGO GENERAL
  // ============================================

  // GET /api/Servicios/catalogo
  getCatalogoServicios(signal) {
    return http.get("/api/Servicios/catalogo", { signal });
  },

  // GET /api/Servicios/catalogo/{id}
  getServicioById(id, signal) {
    return http.get(`/api/Servicios/catalogo/${id}`, { signal });
  },

  // POST /api/Servicios/catalogo
  crearServicio(data) {
    return http.post("/api/Servicios/catalogo", data);
  },

  // PUT /api/Servicios/catalogo/{id}
  actualizarServicio(id, data) {
    return http.put(`/api/Servicios/catalogo/${id}`, data);
  },

  // PUT /api/Servicios/catalogo/{id}/disponibilidad
  actualizarDisponibilidad(id, disponible) {
    return http.put(`/api/Servicios/catalogo/${id}/disponibilidad`, {
      disponible,
    });
  },

  // ============================================
  // LISTA PARA ASIGNAR EN SOLICITUDES
  // (solo servicios disponibles y activos)
  // ============================================

  /**
   * Obtiene los servicios del catálogo pensados para la ASIGNACIÓN
   * de solicitudes.
   *
   * - Llama a GET /api/Servicios/catalogo
   * - Filtra solo los que estén:
   *     - disponible === true
   *     - activo !== false
   * - Devuelve objetos simplificados:
   *   {
   *     servicioID,
   *     nombreEncargado,
   *     tipoServicioNombre,
   *     disponible,
   *     telefono,
   *     email,
   *     numeroServiciosCompletados,
   *     notasInternas
   *   }
   */
  async getServiciosParaAsignacion(signal) {
    const res = await http.get("/api/Servicios/catalogo", { signal });

    const lista = res?.data ?? res ?? [];

    return lista
      .filter((s) => s.disponible === true && s.activo !== false)
      .map((s) => ({
        servicioID: s.servicioID,
        nombreEncargado: s.nombreEncargado,
        tipoServicioNombre: s.tipoServicioNombre,
        disponible: s.disponible,
        telefono: s.telefono,
        email: s.email,
        numeroServiciosCompletados: s.numeroServiciosCompletados ?? 0,
        notasInternas: s.notasInternas ?? null,
      }));
  },
};

export default ServiciosCatalogoAPI;
