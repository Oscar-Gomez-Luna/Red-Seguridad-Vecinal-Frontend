// src/services/avisos.api.js
import { http } from "./http";

/** Lista “cruda” del backend (array de avisos) */
async function listRaw() {
  // GET /api/Avisos → [ { avisoID, usuarioID, categoriaID, titulo, ... } ]
  return await http.get("/Avisos");
}

/** GET /api/Avisos/{id} */
async function getById(id) {
  return await http.get(`/Avisos/${id}`);
}

/** POST /api/Avisos  (crea) */
async function create(payload) {
  const body = {
    usuarioID: Number(payload.usuarioID) || 0,
    categoriaID: Number(payload.categoriaID),
    titulo: payload.titulo?.trim(),
    descripcion: payload.descripcion?.trim(),
    fechaEvento: payload.fechaEvento
      ? new Date(payload.fechaEvento).toISOString()
      : null,
  };
  return await http.post("/Avisos", body);
}

/** PUT /api/Avisos  (actualiza sin id en la ruta; incluye avisoID en el body) */
async function update(id, payload) {
  const body = {
    avisoID: Number(id),
    categoriaID: Number(payload.categoriaID),
    titulo: payload.titulo?.trim(),
    descripcion: payload.descripcion?.trim(),
    fechaEvento: payload.fechaEvento
      ? new Date(payload.fechaEvento).toISOString()
      : null,
  };
  return await http.put("/Avisos", body);
}

/** DELETE /api/Avisos/{id} */
async function remove(id) {
  await http.del(`/Avisos/${id}`);
  return true;
}

/** GET /api/Avisos/categorias-aviso → [{categoriaID, nombre, (opcional) prioridad}] */
async function getCategorias() {
  return await http.get("/Avisos/categorias-aviso");
}

export const AvisosAPI = {
  listRaw,
  getById,
  create,
  update,
  remove,
  getCategorias,
};
