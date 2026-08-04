import { useRef, useState } from "react";
import {
  UploadCloud,
  Camera,
  FileText,
  Image,
  CheckCircle2,
} from "lucide-react";

import Button from "../ui/Button";
import UploadPreviewModal from "./UploadPreviewModal";

export default function NoteUploadPanel({
  onUpload,
  selectedClass,
  selectedSubject,
}) {
  const pdfInput = useRef(null);
  const imageInput = useRef(null);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  const [textNote, setTextNote] = useState("");

  const openPreview = (data) => {
    setUploadData(data);
    setPreviewOpen(true);
  };

  const handlePDF = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    openPreview({
      type: "pdf",
      title: file.name,
      file,
    });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    openPreview({
      type: "image",
      title: file.name,
      file,
    });
  };

  const handleText = () => {
    if (!textNote.trim()) return;

    openPreview({
      type: "text",
      title: "Text Notes",
      textContent: textNote,
    });
  };

  return (
    <>
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 p-8">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <div>

            <h2 className="text-2xl font-bold">
              Upload Study Material
            </h2>

            <p className="text-gray-500 mt-1">
              Upload PDFs, handwritten notes, scanned pages or text.
            </p>

          </div>

          <div className="hidden lg:flex items-center gap-3">

            <span className="px-4 py-2 rounded-full bg-[#EAF8F8] text-[#008388] text-sm font-medium">
              {selectedClass || "Select Class"}
            </span>

            <span className="px-4 py-2 rounded-full bg-[#EEF3FF] text-blue-600 text-sm font-medium">
              {selectedSubject || "Select Subject"}
            </span>

          </div>

        </div>

        {/* Upload Cards */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* PDF */}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

            <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-5">

              <FileText className="text-red-600" size={28} />

            </div>

            <h3 className="font-bold text-lg">
              Upload PDF
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Upload notes, worksheets or question papers.
            </p>

            <button
              onClick={() => pdfInput.current.click()}
              className="
                mt-6
                w-full
                h-44
                rounded-3xl
                border-2
                border-dashed
                border-red-300
                bg-white
                hover:border-[#008388]
                transition
                flex
                flex-col
                items-center
                justify-center
              "
            >

              <UploadCloud size={42} className="text-red-500" />

              <p className="mt-3 font-semibold">
                Click to Upload
              </p>

              <span className="text-xs text-gray-400 mt-1">
                PDF only
              </span>

            </button>

            <input
              hidden
              ref={pdfInput}
              type="file"
              accept=".pdf"
              onChange={handlePDF}
            />

          </div>

          {/* IMAGE */}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

            <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-5">

              <Camera className="text-green-600" size={28} />

            </div>

            <h3 className="font-bold text-lg">
              Camera / Image
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Scan handwritten notes directly from your camera.
            </p>

            <button
              onClick={() => imageInput.current.click()}
              className="
                mt-6
                w-full
                h-44
                rounded-3xl
                border-2
                border-dashed
                border-green-300
                bg-white
                hover:border-[#008388]
                transition
                flex
                flex-col
                items-center
                justify-center
              "
            >

              <Image size={40} className="text-green-600" />

              <p className="mt-3 font-semibold">
                Open Camera / Upload
              </p>

              <span className="text-xs text-gray-400 mt-1">
                JPG • PNG • JPEG
              </span>

            </button>

            <input
              hidden
              ref={imageInput}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
            />

          </div>

          {/* TEXT */}

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">

            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-5">

              <FileText className="text-blue-600" size={28} />

            </div>

            <h3 className="font-bold text-lg">
              Write Notes
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Create quick text notes for your students.
            </p>

            <textarea
              value={textNote}
              onChange={(e) => setTextNote(e.target.value)}
              placeholder="Start typing..."
              className="
                mt-6
                w-full
                h-44
                rounded-3xl
                border
                border-slate-200
                bg-white
                p-5
                resize-none
                outline-none
                focus:border-[#008388]
              "
            />

            <Button
              className="w-full mt-5"
              onClick={handleText}
            >
              Continue
            </Button>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">

          <div className="flex items-center gap-2 text-green-600">

            <CheckCircle2 size={20} />

            <span className="font-medium">
              Supported: PDF, Images & Text Notes
            </span>

          </div>

          <div className="text-sm text-gray-500">
            Maximum Upload Size: 25 MB
          </div>

        </div>

      </div>

      <UploadPreviewModal
        isOpen={previewOpen}
        uploadData={uploadData}
        selectedClass={selectedClass}
        selectedSubject={selectedSubject}
        onClose={() => setPreviewOpen(false)}
        onPublish={onUpload}
      />
    </>
  );
}