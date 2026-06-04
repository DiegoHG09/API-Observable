// src/vizcanvas.js

// ─── CONFIGURACIÓN ──────────────────────────────────────────
// Cuando te den la URL, solo cambias esta línea
const BASE_URL = "";
const API = `${BASE_URL}/api`;

// ─── AUTENTICACIÓN ──────────────────────────────────────────
// Si no necesitas usuario, ignora esta función
// Si sí necesitas, llámala una vez al inicio y guarda el token

/*
export async function login(username, password) {
  const res = await fetch(`${API}/users/sign-in`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error(`Login fallido: ${res.status}`);

  const { token } = await res.json();
  return token;
}
*/

// ─── FUNCIONES DE DATOS ─────────────────────────────────────

// Obtener lista de tablas disponibles en el servidor
export async function getTables(token = null) {
  const res = await fetch(`${API}/tables`, {
    headers: headers(token),
  });

  if (!res.ok) throw new Error(`Error al obtener tablas: ${res.status}`);
  return res.json();
}

// Ejecutar una consulta SQL y obtener resultados
export async function query(sql, token = null) {
  const res = await fetch(`${API}/query/execute-limited`, {
    method: "POST",
    headers: headers(token),
    body: JSON.stringify({ sql }),
  });

  if (!res.ok) throw new Error(`Error en query: ${res.status}`);
  return res.json(); // devuelve { columns, rows, totalRows }
}

// ─── INTERNO ────────────────────────────────────────────────
// Construye los headers con o sin token según sea necesario
function headers(token) {
  const h = { "Content-Type": "application/json" };
  if (token) h["Authorization"] = `Bearer ${token}`;
  return h;
}

 
