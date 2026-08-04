import { useMemo, useState } from "react";

import Button from "../components/ui/Button";
import SearchBar from "../components/ui/SearchBar";
import PageHeader from "../components/ui/PageHeader";

import BatchModal from "../components/batches/BatchModal";
import BatchTable from "../components/batches/BatchTable";

import useBatches from "../hooks/useBatches";

export default function Batches() {
  const {
    batches,
    addBatch,
    editBatch,
    deleteBatch,
  } = useBatches();

  const [showModal, setShowModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredBatches = useMemo(() => {
    const term = searchTerm.toLowerCase();

    return batches.filter((batch) => {
      return (
        batch.batchName.toLowerCase().includes(term) ||
        batch.subject.toLowerCase().includes(term) ||
        batch.teacher.toLowerCase().includes(term) ||
        batch.className.toLowerCase().includes(term)
      );
    });
  }, [batches, searchTerm]);

  const handleAdd = () => {
    setSelectedBatch(null);
    setShowModal(true);
  };

  const handleEdit = (batch) => {
    setSelectedBatch(batch);
    setShowModal(true);
  };

  const handleSave = (batchData) => {
    if (selectedBatch) {
      editBatch({
        ...selectedBatch,
        ...batchData,
      });
    } else {
      addBatch(batchData);
    }

    setShowModal(false);
    setSelectedBatch(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this batch?")) {
      deleteBatch(id);
    }
  };

  return (
    <div className="p-8">

      <PageHeader
        title="Batches"
        subtitle="Manage all tuition batches."
        buttonText="+ Add Batch"
        onButtonClick={handleAdd}
      />

      <div className="mb-6">

        <SearchBar
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search batches..."
        />

      </div>

      <BatchTable
        batches={filteredBatches}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BatchModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBatch(null);
        }}
        onSave={handleSave}
        initialData={selectedBatch}
      />

    </div>
  );
}