import { useState, useEffect, useCallback, useRef } from "react";
import { liveClassesApi } from "../services/api";
import { useAuth } from "./useAuth";
import { detectPlatform, durationMinutes, liveStatus } from "../utils/liveClassUtils";

const REFRESH_MS = 20000;

// The server is the single source of truth. (This hook used to keep its own
// copy in localStorage and invent local-only classes, so the admin could see a
// class - and a link - that the students' server never received.)
function decorate(c) {
  return {
    ...c,
    className: c.className || "",
    batch: c.batch || "",
    subject: c.subject || "",
    teacherName: c.teacherName || "Faculty",
    description: c.description || "",
    meetingLink: c.meetingLink || "",
    platform: detectPlatform(c.meetingLink),
    duration: durationMinutes(c),
  };
}

export default function useLiveClasses() {
  const { token } = useAuth();
  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const alive = useRef(true);

  const fetchLiveClasses = useCallback(async () => {
    if (!token) return;
    try {
      const data = await liveClassesApi.list(token);
      if (!alive.current) return;
      setLiveClasses(Array.isArray(data) ? data.map(decorate) : []);
      setError("");
      setLastUpdated(new Date());
    } catch (err) {
      if (alive.current) setError(err.message || "Could not load live classes.");
    } finally {
      if (alive.current) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    alive.current = true;
    fetchLiveClasses();

    // Keep the page current without a manual reload: refetch every 20 seconds
    // and whenever the tab becomes visible again.
    const refresh = () => {
      if (document.visibilityState === "visible") fetchLiveClasses();
    };
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    const timer = setInterval(refresh, REFRESH_MS);
    return () => {
      alive.current = false;
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
      clearInterval(timer);
    };
  }, [fetchLiveClasses]);

  // These throw on failure so the form can show the real reason and stay open.
  const addLiveClass = async (data) => {
    await liveClassesApi.create(token, data);
    await fetchLiveClasses();
  };

  const editLiveClass = async (id, data) => {
    await liveClassesApi.update(token, id, data);
    await fetchLiveClasses();
  };

  const deleteLiveClass = async (id) => {
    await liveClassesApi.remove(token, id);
    await fetchLiveClasses();
  };

  return {
    liveClasses,
    loading,
    error,
    lastUpdated,
    addLiveClass,
    editLiveClass,
    deleteLiveClass,
    getStatus: (cls) => liveStatus(cls),
    refreshLiveClasses: fetchLiveClasses,
  };
}
