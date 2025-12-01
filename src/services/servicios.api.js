// src/services/servicios.api.js
import { ServiciosCargosServiciosAPI } from "./serviciosCargosServicios.api";
import { ServiciosCargosMantenimientoAPI } from "./serviciosCargosMantenimiento.api";

// Este "admin" solo agrupa los cargos, como dijiste
export const ServiciosAPI = {
  cargosServicios: ServiciosCargosServiciosAPI,
  cargosMantenimiento: ServiciosCargosMantenimientoAPI,
};

export default ServiciosAPI;
