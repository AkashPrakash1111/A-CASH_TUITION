// Dev: talk to the local backend. Production build: same origin (the backend
// serves the site), unless VITE_API_URL points somewhere else.
const API_URL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://localhost:8000" : "");

/**
 * Thin fetch wrapper with JWT bearer token and standardized error messaging.
 */
async function request(path, { method = "GET", body, token, headers = {}, signal } = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    signal,
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
    // response had no JSON body
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

  register: (name, email, password) =>
    request("/auth/register", { method: "POST", body: { name, email, password } }),

  me: (token) => request("/auth/me", { token }),

  updateAvatar: (token, config) =>
    request("/auth/me/avatar", { method: "PUT", token, body: { config } }),

  // Returns { access_token, user } — a fresh token, because changing the
  // email can change what the current token resolves to on the server.
  updateProfile: (token, { name, email }) =>
    request("/auth/me", { method: "PUT", token, body: { name, email } }),

  changePassword: (token, currentPassword, newPassword) =>
    request("/auth/me/password", {
      method: "PUT",
      token,
      body: { current_password: currentPassword, new_password: newPassword },
    }),

  // Admin only — used by the Users & Access panel in Settings.
  listUsers: (token) => request("/auth/users", { token }),

  setUserStatus: (token, userId, isActive) =>
    request(`/auth/users/${userId}/status`, {
      method: "PATCH",
      token,
      body: { is_active: isActive },
    }),
};

export const adminApi = {
  createUser: (token, { name, email, password, role = "student" }) =>
    request("/auth/admin/create-user", {
      method: "POST",
      token,
      body: { name, email, password, role },
    }),
};

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
  updateAvatar: (token, id, config) =>
    request(`/teachers/${id}/avatar`, { method: "PUT", token, body: { config } }),
  remove: (token, id) => request(`/teachers/${id}`, { method: "DELETE", token }),
};

export const subjectsApi = {
  list: (token) => request("/subjects", { token }),
  create: (token, data) => request("/subjects", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/subjects/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/subjects/${id}`, { method: "DELETE", token }),
};

export const batchesApi = {
  list: (token) => request("/batches", { token }),
  create: (token, data) => request("/batches", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/batches/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/batches/${id}`, { method: "DELETE", token }),
};

export const notesApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notes${query ? `?${query}` : ""}`, { token });
  },
  get: (token, id) => request(`/notes/${id}`, { token }),
  create: (token, data) => request("/notes", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/notes/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/notes/${id}`, { method: "DELETE", token }),
  // A student's own private uploads
  // Admin/teacher: what students have uploaded for themselves
  listStudentUploads: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/notes/student-uploads${query ? `?${query}` : ""}`, { token });
  },
  listMine: (token) => request("/notes/mine", { token }),
  createMine: (token, data) => request("/notes/mine", { method: "POST", token, body: data }),
  getAnnotations: (token, noteId) => request(`/notes/${noteId}/annotations`, { token }),
  // AnnotationCanvas calls this name; without it, opening a saved note's studio throws.
  listAnnotations: (token, noteId) => request(`/notes/${noteId}/annotations`, { token }),
  saveAnnotation: (token, noteId, data) =>
    request(`/notes/${noteId}/annotations`, { method: "POST", token, body: data }),
};

export const assignmentsApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/assignments${query ? `?${query}` : ""}`, { token });
  },
  get: (token, id) => request(`/assignments/${id}`, { token }),
  create: (token, data) => request("/assignments", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/assignments/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/assignments/${id}`, { method: "DELETE", token }),
  submit: (token, assignmentId, data) =>
    request(`/assignments/${assignmentId}/submit`, { method: "POST", token, body: data }),
  listSubmissions: (token, assignmentId) =>
    request(`/assignments/${assignmentId}/submissions`, { token }),
  getSubmission: (token, submissionId) =>
    request(`/assignments/submissions/${submissionId}`, { token }),
  getMySubmissions: (token) => request("/assignments/student/my-submissions", { token }),
  grade: (token, submissionId, data) =>
    request(`/assignments/submissions/${submissionId}/grade`, { method: "PUT", token, body: data }),
};

export const examsApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/exams${query ? `?${query}` : ""}`, { token });
  },
  get: (token, id) => request(`/exams/${id}`, { token }),
  create: (token, data) => request("/exams", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/exams/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/exams/${id}`, { method: "DELETE", token }),
  delete: (token, id) => request(`/exams/${id}`, { method: "DELETE", token }),
  submitAttempt: (token, examId, data) =>
    request(`/exams/${examId}/submit`, { method: "POST", token, body: data }),
  submit: (token, examId, data) =>
    request(`/exams/${examId}/submit`, { method: "POST", token, body: data }),
  listSubmissions: (token, examId) => request(`/exams/${examId}/submissions`, { token }),
  getSubmission: (token, submissionId) =>
    request(`/exams/submissions/${submissionId}`, { token }),
  getMySubmissions: (token) => request("/exams/student/my-submissions", { token }),
  grade: (token, submissionId, data) =>
    request(`/exams/submissions/${submissionId}/grade`, { method: "PUT", token, body: data }),
  parseBulkQuestions: (token, rawText) =>
    request("/exams/parse-bulk-questions", { method: "POST", token, body: { rawText } }),
};

export const progressApi = {
  // tz_offset = minutes east of UTC so streak days roll over at the student's midnight
  me: (token, signal) =>
    request(`/progress/me?tz_offset=${-new Date().getTimezoneOffset()}`, { token, signal }),
};

export const rewardsApi = {
  getBalance: (token) => request("/rewards/balance", { token }),
  getConfig: (token) => request("/rewards/config", { token }),
  updateConfig: (token, data) =>
    request("/rewards/config", { method: "PUT", token, body: data }),
  adminGrant: (token, data) =>
    request("/rewards/admin/grant", { method: "POST", token, body: data }),
  listItems: (token, category) => {
    const query = category ? `?category=${encodeURIComponent(category)}` : "";
    return request(`/rewards/items${query}`, { token });
  },
  createItem: (token, data) =>
    request("/rewards/items", { method: "POST", token, body: data }),
  updateItem: (token, id, data) =>
    request(`/rewards/items/${id}`, { method: "PUT", token, body: data }),
  deleteItem: (token, id) =>
    request(`/rewards/items/${id}`, { method: "DELETE", token }),
  purchase: (token, data) =>
    request("/rewards/purchase", { method: "POST", token, body: data }),
  getMyOrders: (token) => request("/rewards/orders/my-orders", { token }),
  getAllOrders: (token) => request("/rewards/orders/all", { token }),
  updateOrderStatus: (token, orderId, data) =>
    request(`/rewards/orders/${orderId}/status`, { method: "PUT", token, body: data }),
};

export const parentsApi = {
  getStudentAnalysis: (token, studentId) =>
    request(`/parents/analysis/${studentId}`, { token }),
  getMyStudent: (token) => request("/parents/my-student", { token }),
  linkParent: (token, data) =>
    request("/parents/link", { method: "POST", token, body: data }),
};

export const liveClassesApi = {
  list: (token, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/live-classes${query ? `?${query}` : ""}`, { token });
  },
  get: (token, id) => request(`/live-classes/${id}`, { token }),
  create: (token, data) => request("/live-classes", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/live-classes/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/live-classes/${id}`, { method: "DELETE", token }),
};

export const messagesApi = {
  getMyMessages: (token) => request("/messages", { token }),
  getThread: (token, otherUserId) => request(`/messages/thread/${otherUserId}`, { token }),
  sendMessage: (token, data) => request("/messages", { method: "POST", token, body: data }),
  getSupervisedMessages: (token, studentUserId) =>
    request(`/messages/supervised/${studentUserId}`, { token }),
  listAuditLogs: (token) => request("/messages/audit-logs", { token }),
};

export const aiApi = {
  generate: (token, tool, inputs) =>
    request("/ai/generate", { method: "POST", token, body: { tool, inputs } }),
  getStatus: (token) => request("/ai/status", { token }),
  getTemplates: (token) => request("/ai/templates", { token }),
};

export const filesApi = {
  upload: async (token, file, category = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);

    const res = await fetch(`${API_URL}/files/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.detail || "File upload failed");
    }
    return data;
  },

  uploadBase64: (token, dataUrl, fileName, category = "general") =>
    request("/files/upload-base64", {
      method: "POST",
      token,
      body: { dataUrl, fileName, category },
    }),

  resolveFileUrl: (path, token) => {
    if (!path) return "";
    if (
      path.startsWith("data:") ||
      path.startsWith("blob:") ||
      path.startsWith("http://") ||
      path.startsWith("https://")
    ) {
      return path;
    }
    const base = `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
    return token ? `${base}?token=${encodeURIComponent(token)}` : base;
  },
};


