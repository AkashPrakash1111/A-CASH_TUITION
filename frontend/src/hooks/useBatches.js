import { useState } from "react";

const STORAGE_KEY = "acash_batches";

export default function useBatches() {
  const [batches, setBatches] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  const save = (updated) => {
    setBatches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addBatch = (batch) => {
    const updated = [
      ...batches,
      {
        id: crypto.randomUUID(),
        ...batch,
      },
    ];

    save(updated);
  };

  const editBatch = (updatedBatch) => {
    const updated = batches.map((batch) =>
      batch.id === updatedBatch.id ? updatedBatch : batch
    );

    save(updated);
  };

  const deleteBatch = (id) => {
    const updated = batches.filter((batch) => batch.id !== id);

    save(updated);
  };

  return {
    batches,
    addBatch,
    editBatch,
    deleteBatch,
  };
}
