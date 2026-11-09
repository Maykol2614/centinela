export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const CLAVE = "centinela_token";

export function getToken() {
  try {
    return localStorage.getItem(CLAVE);
  } catch (e) {
    return null;
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE, token);
  } catch (e) {
    // Si el navegador bloquea el almacenamiento, la sesión dura hasta recargar.
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE);
  } catch (e) {
    // nada que hacer
  }
}
