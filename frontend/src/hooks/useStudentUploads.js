import { useEffect, useState } from "react";
import { notesApi } from "../services/api";
import { useAuth } from "./useAuth";

function normalize(n) {
  return {
    ...n,
    description: n.description || "",
    subject: n.subject || "",
    type: n.type || "text",
    fileName: n.fileName || n.title,
    fileUrl: n.fileUrl || "",
    textContent: n.textContent || "",
    uploadedAt: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recently",
  };
}

// Admin/teacher view of what students have uploaded. Not cached in
// localStorage, so nothing from here is left behind in the browser.
// `enabled` lets the page skip the request until the tab is opened.
export default function useStudentUploads(enabled) {
  const { token } = useAuth();
  const [state, setState] = useState({ status: "loading", uploads: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token || !enabled) return undefined;
    let cancelled = false;

    notesApi
      .listStudentUploads(token)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ready", uploads: Array.isArray(data) ? data.map(normalize) : [], error: "" });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", uploads: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [token, enabled, reloadKey]);

  const reload = () => {
    setState((prev) => ({ ...prev, status: "loading", error: "" }));
    setReloadKey((k) => k + 1);
  };

  const removeUpload = async (id) => {
    await notesApi.remove(token, id);
    setState((prev) => ({ ...prev, uploads: prev.uploads.filter((n) => n.id !== id) }));
  };

  return {
    uploads: state.uploads,
    loading: state.status === "loading",
    error: state.status === "error" ? state.error : "",
    reload,
    removeUpload,
  };
}
