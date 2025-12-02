// src/services/avisos.api.js
import { http } from "./http";

/** Lista "cruda" del backend */
async function listRaw() {
  return await http.get("/Avisos");
}

/** GET /api/Avisos/{id} */
async function getById(id) {
  return await http.get(`/Avisos/${id}`);
}

/** POST /api/Avisos (crea) */
async function create(payload) {
  console.log("Payload recibido en avisos.api.create:", payload);
  
  // Obtener usuarioID del localStorage si no viene en payload
  let usuarioID = payload.usuarioID;
  if (!usuarioID) {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        usuarioID = user.id || user.userID || user.usuarioID;
      }
    } catch (error) {
      console.error("Error al obtener usuario de localStorage:", error);
    }
  }
  
  // Usar 9 como fallback
  if (!usuarioID) {
    usuarioID = 9;
  }
  
  const body = {
    UsuarioID: Number(usuarioID),
    CategoriaID: Number(payload.categoriaID) || 1,
    Titulo: payload.titulo?.trim() || "Aviso sin título",
    Descripcion: payload.descripcion?.trim() || "Sin contenido",
    FechaEvento: payload.fechaEvento 
      ? new Date(payload.fechaEvento).toISOString()
      : null,
  };
  
  console.log("Body para backend:", JSON.stringify(body, null, 2));
  
  try {
    const result = await http.post("/Avisos", body);
    console.log("Respuesta de API:", result);
    return result;
  } catch (error) {
    console.error("Error en avisos.api.create:", error);
    throw error;
  }
}

/** PUT /api/Avisos (actualiza) */
async function update(id, payload) {
  const body = {
    AvisoID: Number(id),
    CategoriaID: Number(payload.categoriaID),
    Titulo: payload.titulo?.trim(),
    Descripcion: payload.descripcion?.trim(),
    FechaEvento: payload.fechaEvento
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

/** GET /api/Avisos/categorias-aviso */
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