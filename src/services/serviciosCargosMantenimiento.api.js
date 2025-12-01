// src/services/serviciosCargosMantenimiento.api.js
import http from "./http";

export const ServiciosCargosMantenimientoAPI = {
  getCargosMantenimiento(signal) {
    return http.get("/api/Servicios/cargos-mantenimiento", { signal });
  },
  // agrega aquí los métodos que necesites...
};

export default ServiciosCargosMantenimientoAPI;
