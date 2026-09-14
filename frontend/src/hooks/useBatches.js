import { useEffect, useState } from "react";
import { batchesApi } from "../services/api";
import { useAuth } from "./useAuth";

export default function useBatches() {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    batchesApi
      .list(token)
      .then(setBatches)
      .catch((err) => console.error("Failed to load batches:", err))
      .finally(() => setLoading(false));
  }, [token]);

  const addBatch = async (batch) => {
    const created = await batchesApi.create(token, batch);
    setBatches((prev) => [created, ...prev]);
    return created;
  };

  const editBatch = async (updatedBatch) => {
    const saved = await batchesApi.update(token, updatedBatch.id, updatedBatch);
    setBatches((prev) =>
      prev.map((batch) => (batch.id === saved.id ? saved : batch))
    );
    return saved;
  };

  const deleteBatch = async (id) => {
    await batchesApi.remove(token, id);
    setBatches((prev) => prev.filter((batch) => batch.id !== id));
  };

  return {
    batches,
    loading,
    addBatch,
    editBatch,
    deleteBatch,
  };
}
