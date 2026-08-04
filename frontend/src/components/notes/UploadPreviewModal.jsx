import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

export default function UploadPreviewModal({
  isOpen,
  onClose,
  onPublish,
  uploadData,
  selectedClass,
  selectedSubject,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saveAs, setSaveAs] = useState("image");

  useEffect(() => {
    if (uploadData) {
      setTitle(uploadData.title || "");
      setDescription("");

      if (uploadData.type === "pdf") {
        setSaveAs("pdf");
      } else {
        setSaveAs(uploadData.type);
      }
    }
  }, [uploadData]);

  if (!isOpen || !uploadData) return null;

  const publish = () => {
    onPublish({
      className: selectedClass,
      subject: selectedSubject,

      title,

      description,

      type: saveAs,

      fileName: uploadData.file?.name || "",

      fileUrl: "",

      textContent:
        uploadData.textContent || "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-3xl w-full max-w-3xl p-8">

        <h2 className="text-3xl font-bold">
          Publish Notes
        </h2>

        <p className="text-gray-500 mt-2">
          Review before publishing.
        </p>

        <div className="grid grid-cols-2 gap-6 mt-8">

          <Input
            label="Title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />

          <Input
            label="Description"
            value={description}
            onChange={(e) =>
              setDescription(e.target.value)
            }
          />

        </div>

        <div className="mt-8">

          <label className="font-semibold">
            Publish As
          </label>

          <div className="flex gap-4 mt-3">

            <button
              onClick={() => setSaveAs("pdf")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "pdf"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              PDF
            </button>

            <button
              onClick={() => setSaveAs("image")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "image"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              Image
            </button>

            <button
              onClick={() => setSaveAs("text")}
              className={`px-5 py-3 rounded-xl border ${
                saveAs === "text"
                  ? "bg-[#008388] text-white"
                  : ""
              }`}
            >
              Text
            </button>

          </div>

        </div>

        <div className="flex justify-end gap-3 mt-10">

          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button onClick={publish}>
            Publish Notes
          </Button>

        </div>

      </div>

    </div>
  );
}