import { useEffect, useState } from "react";
import { assignmentsApi } from "../services/api";
import { useAuth } from "./useAuth";

// The logged-in student's assignments, already limited by the server to their
// own class and batch, each with their own submission folded in.
// Not cached in localStorage: it contains personal work and marks.
export default function useStudentAssignments() {
  const { token } = useAuth();
  const [state, setState] = useState({ status: "loading", assignments: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    assignmentsApi
      .list(token)
      .then((data) => {
        if (!cancelled) {
          setState({ status: "ready", assignments: Array.isArray(data) ? data : [], error: "" });
        }
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", assignments: [], error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const reload = () => setReloadKey((k) => k + 1);

  return {
    assignments: state.assignments,
    loading: state.status === "loading",
    error: state.status === "error" ? state.error : "",
    reload,
  };
}
