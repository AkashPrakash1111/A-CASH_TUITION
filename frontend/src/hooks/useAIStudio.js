import { useState } from "react";

import { aiApi } from "../services/api";
import { useAuth } from "./useAuth";

const HISTORY_PREFIX = "acash_ai_history_";
const MAX_HISTORY = 10;

function getHistory(toolId) {
  const stored = localStorage.getItem(HISTORY_PREFIX + toolId);
  return stored ? JSON.parse(stored) : [];
}

function saveToHistory(toolId, entry) {
  const updated = [entry, ...getHistory(toolId)].slice(0, MAX_HISTORY);
  localStorage.setItem(HISTORY_PREFIX + toolId, JSON.stringify(updated));
  return updated;
}

export default function useAIStudio() {
  const { token } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (toolId, inputs) => {
    setLoading(true);
    setError(null);

    try {
      const response = await aiApi.generate(token, toolId, inputs);

      const entry = {
        id: crypto.randomUUID(),
        inputs,
        content: response.content,
        createdAt: new Date().toLocaleString(),
      };

      saveToHistory(toolId, entry);

      return entry;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = (toolId) => {
    localStorage.removeItem(HISTORY_PREFIX + toolId);
  };

  return { generate, loading, error, setError, getHistory, clearHistory };
}
