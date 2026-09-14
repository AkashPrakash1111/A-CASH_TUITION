const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Thin fetch wrapper. Deliberately avoids adding axios as a new dependency
 * since the project doesn't have it installed yet and native fetch covers
 * everything we need here.
 */
async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // response had no JSON body (e.g. some errors) — that's fine
  }

  if (!res.ok) {
    const message = data?.detail || "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  // Public self-registration always creates a student account (enforced by
  // the backend regardless of what's sent here) — no role field on purpose.
  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password } }),

  me: (token) => request("/auth/me", { token }),

  // Any logged-in user can update their OWN avatar — no admin check needed,
  // the backend scopes this to whoever's token is sent.
  updateAvatar: (token, config) =>
    request("/auth/me/avatar", { method: "PUT", token, body: { config } }),
};

export const adminApi = {
  // Requires an admin's token. Used by the Students page to create a real
  // login for a newly added student, alongside their roster entry.
  createUser: (token, { name, email, password, role = "student" }) =>
    request("/auth/admin/create-user", {
      method: "POST",
      token,
      body: { name, email, password, role },
    }),
};

// All four follow the same shape: list/create/update/delete, all requiring
// an admin token (enforced by the backend, not just hidden in the UI).

export const studentsApi = {
  list: (token) => request("/students", { token }),
  create: (token, data) => request("/students", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/students/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/students/${id}`, { method: "DELETE", token }),
};

export const teachersApi = {
  list: (token) => request("/teachers", { token }),
  create: (token, data) => request("/teachers", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/teachers/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/teachers/${id}`, { method: "DELETE", token }),
};

export const subjectsApi = {
  list: (token) => request("/subjects", { token }),
  create: (token, data) => request("/subjects", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/subjects/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/subjects/${id}`, { method: "DELETE", token }),
};

export const aiApi = {
  generate: (token, tool, inputs) =>
    request("/ai/generate", { method: "POST", token, body: { tool, inputs } }),
};

export const batchesApi = {
  list: (token) => request("/batches", { token }),
  create: (token, data) => request("/batches", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/batches/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/batches/${id}`, { method: "DELETE", token }),
};
