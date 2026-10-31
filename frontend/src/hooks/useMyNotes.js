import { useEffect, useState } from "react";
import { notesApi } from "../services/api";
import { useAuth } from "./useAuth";

// Shape a server note the way the note cards expect it.
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

// A student's private uploads. Deliberately NOT cached in localStorage: these
// are personal, and a browser cache would outlive the login.
export default function useMyNotes() {
  const { token } = useAuth();
  const [state, setState] = useState({ status: "loading", notes: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    notesApi
      .listMine(token)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ready", notes: Array.isArray(data) ? data.map(normalize) : [], error: "" });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", notes: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const retry = () => {
    setState({ status: "loading", notes: [], error: "" });
    setReloadKey((k) => k + 1);
  };

  const addMyNote = async (payload) => {
    const created = await notesApi.createMine(token, payload);
    setState((prev) => ({ ...prev, status: "ready", notes: [normalize(created), ...prev.notes] }));
    return created;
  };

  const deleteMyNote = async (id) => {
    await notesApi.remove(token, id);
    setState((prev) => ({ ...prev, notes: prev.notes.filter((n) => n.id !== id) }));
  };

  return {
    myNotes: state.notes,
    loading: state.status === "loading",
    error: state.status === "error" ? state.error : "",
    retry,
    addMyNote,
    deleteMyNote,
  };
}
