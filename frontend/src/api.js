// Vite proxies /api requests to the existing Express server at localhost:5000.
// Optional: set VITE_API_URL=http://localhost:5000/api to call Express directly.
const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');

export async function api(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  const raw = await response.text();
  let value;
  try { value = raw ? JSON.parse(raw) : null; }
  catch { value = raw; }

  if (!response.ok) {
    const message = typeof value === 'string'
      ? value
      : value?.error || value?.message || value?.details || `Request failed (${response.status})`;
    throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
  }
  return value;
}

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.Items)) return payload.Items;
  if (Array.isArray(payload?.records)) return payload.records;
  if (payload == null) return [];
  throw new Error('Unexpected list response from backend. Check the API JSON shape.');
}

export async function getList(resource) {
  return normalizeList(await api(`/${resource}`));
}

export async function saveRecord(resource, record, id) {
  return api(id ? `/${resource}/${encodeURIComponent(id)}` : `/${resource}`, {
    method: id ? 'PUT' : 'POST',
    body: JSON.stringify(record)
  });
}



export async function deleteRecord(resource, id) {
  const BASE = (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api"
  ).replace(/\/$/, "");

  const query =
    resource === "students"
      ? "?confirm=DELETE"
      : "";

  const url =
    `${BASE}/${resource}/${encodeURIComponent(id)}${query}`;

  const response = await fetch(url, {
    method: "DELETE"
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
      `Delete failed (HTTP ${response.status})`
    );
  }

  return data;
}


