// src/context/Servicios/ServiciosState.jsx
import { useCallback, useMemo, useState } from "react";
import ServiciosContext from "./ServiciosContext";

import { ServiciosTiposAPI } from "../../services/serviciosTipos.api";
import { ServiciosCatalogoAPI } from "../../services/serviciosCatalogo.api";
import { ServiciosPersonalAPI } from "../../services/serviciosPersonal.api";
import { ServiciosSolicitudesAPI } from "../../services/serviciosSolicitudes.api";

export default function ServiciosState({ children }) {
  const [catalogo, setCatalogo] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [personal, setPersonal] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // -------- helpers ----------
  const startLoading = useCallback(() => setLoading(true), []);
  const stopLoading = useCallback(() => setLoading(false), []);

  const handleError = useCallback((err, msg) => {
    console.error(err);
    setError(msg || "Ocurrió un error en el módulo de servicios.");
  }, []);

  // =========================================================
  // TIPOS DE SERVICIO
  // =========================================================
  const cargarTiposServicio = useCallback(async () => {
    try {
      startLoading();
      const res = await ServiciosTiposAPI.getTiposServicio();
      setTipos(res?.data ?? res ?? []);
      setError("");
    } catch (err) {
      handleError(err, "Error al cargar los tipos de servicio.");
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, handleError]);

  // =========================================================
  // CATÁLOGO DE SERVICIOS
  // =========================================================
  const cargarCatalogoServicios = useCallback(async () => {
    try {
      startLoading();
      const res = await ServiciosCatalogoAPI.getCatalogoServicios();
      setCatalogo(res?.data ?? res ?? []);
      setError("");
    } catch (err) {
      handleError(err, "Error al cargar el catálogo de servicios.");
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, handleError]);

  const crearServicioCatalogo = useCallback(
    async (data) => {
      try {
        startLoading();
        await ServiciosCatalogoAPI.crearServicio(data);
        await cargarCatalogoServicios();
      } catch (err) {
        handleError(err, "Error al crear el servicio.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarCatalogoServicios]
  );

  const actualizarServicioCatalogo = useCallback(
    async (id, data) => {
      try {
        startLoading();
        await ServiciosCatalogoAPI.actualizarServicio(id, data);
        await cargarCatalogoServicios();
      } catch (err) {
        handleError(err, "Error al actualizar el servicio.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarCatalogoServicios]
  );

  const actualizarDisponibilidadServicio = useCallback(
    async (id, disponible) => {
      try {
        startLoading();
        await ServiciosCatalogoAPI.actualizarDisponibilidad(id, disponible);
        await cargarCatalogoServicios();
      } catch (err) {
        handleError(err, "Error al actualizar la disponibilidad.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarCatalogoServicios]
  );

  // =========================================================
  // PERSONAL DE MANTENIMIENTO
  // =========================================================
  const cargarPersonalMantenimiento = useCallback(async () => {
    try {
      startLoading();
      const res = await ServiciosPersonalAPI.getPersonalMantenimiento();
      setPersonal(res?.data ?? res ?? []);
      setError("");
    } catch (err) {
      handleError(err, "Error al cargar el personal de mantenimiento.");
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, handleError]);

  const crearPersonalMantenimiento = useCallback(
    async (data) => {
      try {
        startLoading();
        await ServiciosPersonalAPI.crearPersonalMantenimiento(data);
        await cargarPersonalMantenimiento();
      } catch (err) {
        handleError(err, "Error al registrar el personal de mantenimiento.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarPersonalMantenimiento]
  );

  // =========================================================
  // SOLICITUDES DE SERVICIO
  // =========================================================
  const cargarSolicitudes = useCallback(async () => {
    try {
      startLoading();
      const res = await ServiciosSolicitudesAPI.getSolicitudesServicios();
      setSolicitudes(res?.data ?? res ?? []);
      setError("");
    } catch (err) {
      handleError(err, "Error al cargar las solicitudes de servicio.");
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, handleError]);

  const crearSolicitud = useCallback(
    async (data) => {
      try {
        startLoading();
        await ServiciosSolicitudesAPI.crearSolicitudServicio(data);
        await cargarSolicitudes();
      } catch (err) {
        handleError(err, "Error al crear la solicitud de servicio.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarSolicitudes]
  );

  const asignarSolicitud = useCallback(
    async (solicitudID, personaAsignado) => {
      try {
        startLoading();
        await ServiciosSolicitudesAPI.asignarSolicitudServicio(
          solicitudID,
          personaAsignado
        );
        await cargarSolicitudes();
      } catch (err) {
        handleError(err, "Error al asignar la solicitud.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarSolicitudes]
  );

  const actualizarEstadoSolicitud = useCallback(
    async (solicitudID, estado) => {
      try {
        startLoading();
        await ServiciosSolicitudesAPI.actualizarEstadoSolicitud(
          solicitudID,
          estado
        );
        await cargarSolicitudes();
      } catch (err) {
        handleError(err, "Error al cambiar el estado de la solicitud.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarSolicitudes]
  );

  const completarSolicitud = useCallback(
    async (solicitudID, payload) => {
      try {
        startLoading();
        await ServiciosSolicitudesAPI.completarSolicitudServicio(
          solicitudID,
          payload?.notasAdmin ?? ""
        );
        await cargarSolicitudes();
      } catch (err) {
        handleError(err, "Error al completar la solicitud.");
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading, handleError, cargarSolicitudes]
  );

  // =========================================================
  // VALUE MEMOIZADO
  // =========================================================
  const value = useMemo(
    () => ({
      catalogo,
      tipos,
      personal,
      solicitudes,
      loading,
      error,
      cargarTiposServicio,
      cargarCatalogoServicios,
      crearServicioCatalogo,
      actualizarServicioCatalogo,
      actualizarDisponibilidadServicio,
      cargarPersonalMantenimiento,
      crearPersonalMantenimiento,
      cargarSolicitudes,
      crearSolicitud,
      asignarSolicitud,
      actualizarEstadoSolicitud,
      completarSolicitud,
    }),
    [
      catalogo,
      tipos,
      personal,
      solicitudes,
      loading,
      error,
      cargarTiposServicio,
      cargarCatalogoServicios,
      crearServicioCatalogo,
      actualizarServicioCatalogo,
      actualizarDisponibilidadServicio,
      cargarPersonalMantenimiento,
      crearPersonalMantenimiento,
      cargarSolicitudes,
      crearSolicitud,
      asignarSolicitud,
      actualizarEstadoSolicitud,
      completarSolicitud,
    ]
  );

  return (
    <ServiciosContext.Provider value={value}>
      {children}
    </ServiciosContext.Provider>
  );
}
