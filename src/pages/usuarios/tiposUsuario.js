export const TIPOS_USUARIO = {
  USUARIO: 1,
  ADMIN: 2,
  GUARDIA: 3,
};

export const TIPO_USUARIO_LABEL = {
  [TIPOS_USUARIO.USUARIO]: "Usuario",
  [TIPOS_USUARIO.ADMIN]: "Admin",
  [TIPOS_USUARIO.GUARDIA]: "Guardia",
};

export function parseTipoUsuarioID(raw) {
  if (raw == null) return null;

  if (typeof raw === "number") return raw || null;

  if (typeof raw === "object") {
    return parseTipoUsuarioID(
      raw.tipoUsuarioID ?? raw.tipoUsuario ?? raw.nombre ?? raw.id ?? null
    );
  }

  if (typeof raw === "string") {
    const t = raw.trim();
    if (!t) return null;

    const num = Number(t);
    if (!Number.isNaN(num)) return num;

    // Intentar como texto
    const s = t.toLowerCase();
    if (s.includes("usuario") || s.includes("residente")) return TIPOS_USUARIO.USUARIO;
    if (s.includes("admin")) return TIPOS_USUARIO.ADMIN;
    if (s.includes("guardia") || s.includes("seguridad")) return TIPOS_USUARIO.GUARDIA;
  }

  return null;
}

export const esUsuario = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.USUARIO;

export const esAdmin = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.ADMIN;

export const esGuardia = (tipo) =>
  parseTipoUsuarioID(tipo) === TIPOS_USUARIO.GUARDIA;

// Para usar en selects y formularios
export const OPCIONES_TIPOS_USUARIO = [
  { value: TIPOS_USUARIO.USUARIO, label: "Usuario" },
  { value: TIPOS_USUARIO.ADMIN, label: "Admin" },
  { value: TIPOS_USUARIO.GUARDIA, label: "Guardia" },
];