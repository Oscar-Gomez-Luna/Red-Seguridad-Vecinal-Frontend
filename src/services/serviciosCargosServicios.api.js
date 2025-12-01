// src/services/serviciosCargosServicios.api.js
import { http } from "./http";

const BASE_URL = "/Servicios/cargos/servicios";

export const ServiciosCargosServiciosAPI = {
  // GET /api/Servicios/cargos/servicios
  async getAll(signal) {
    const res = await http.get(BASE_URL, { signal });
    return res.data;
  },

  // GET /api/Servicios/cargos/servicios/usuario/{usuarioId}
  async getByUsuario(usuarioId, signal) {
    if (!usuarioId) throw new Error("usuarioID es requerido");
    const res = await http.get(`${BASE_URL}/usuario/${usuarioId}`, { signal });
    return res.data;
  },

  // GET /api/Servicios/cargos/servicios/solicitud/{solicitudId}
  async getBySolicitud(solicitudId, signal) {
    if (!solicitudId) throw new Error("solicitudID es requerido");
    const res = await http.get(`${BASE_URL}/solicitud/${solicitudId}`, {
      signal,
    });
    return res.data;
  },

  // POST /api/Servicios/cargos/servicios
  // data: { usuarioID, solicitudID, concepto, monto, estado, montoPagado, saldoPendiente, ... }
  async create(data) {
    const res = await http.post(BASE_URL, data);
    return res.data;
  },
};
