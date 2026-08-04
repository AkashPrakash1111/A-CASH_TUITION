import {
  Calendar,
  FileText,
  Download,
  Eye,
  MoreVertical,
} from "lucide-react";

export default function StudentSubmissionCard({
  studentName,
  avatar,
  noteTitle,
  fileName,
  fileSize,
  submittedAt,
  status,
}) {
  const badgeStyle = {
    Published: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    Draft: "bg-gray-200 text-gray-700",
  };

  return (
    <div
      className="
        bg-white
        rounded-[28px]
        border
        border-slate-200
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        overflow-hidden
      "
    >
      {/* Header */}

      <div className="flex items-center justify-between p-5">

        <div className="flex items-center gap-4">

          <div
            className="
              w-16
              h-16
              rounded-2xl
              bg-[#EAF8F8]
              flex
              items-center
              justify-center
              overflow-hidden
            "
          >
            {avatar ? (
              <img
                src={avatar}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl">
                👨‍🎓
              </span>
            )}
          </div>

          <div>

            <h3 className="font-bold text-lg">
              {studentName}
            </h3>

            <p className="text-gray-500 text-sm">
              {noteTitle}
            </p>

          </div>

        </div>

        <button
          className="
            w-10
            h-10
            rounded-xl
            hover:bg-slate-100
            flex
            items-center
            justify-center
          "
        >
          <MoreVertical size={20} />
        </button>

      </div>

      {/* File Preview */}

      <div className="px-5">

        <div
          className="
            bg-slate-50
            rounded-2xl
            p-4
            flex
            items-center
            justify-between
          "
        >
          <div className="flex items-center gap-4">

            <div
              className="
                w-14
                h-14
                rounded-xl
                bg-red-100
                text-red-600
                flex
                items-center
                justify-center
              "
            >
              <FileText size={28} />
            </div>

            <div>

              <h4 className="font-semibold">
                {fileName}
              </h4>

              <p className="text-sm text-gray-500">
                {fileSize || "Unknown Size"}
              </p>

            </div>

          </div>

          <div className="flex gap-2">

            <button
              className="
                w-10
                h-10
                rounded-xl
                bg-blue-50
                hover:bg-blue-100
                flex
                items-center
                justify-center
              "
            >
              <Eye
                size={18}
                className="text-blue-600"
              />
            </button>

            <button
              className="
                w-10
                h-10
                rounded-xl
                bg-green-50
                hover:bg-green-100
                flex
                items-center
                justify-center
              "
            >
              <Download
                size={18}
                className="text-green-600"
              />
            </button>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="flex items-center justify-between px-5 py-5">

        <div className="flex items-center gap-2 text-gray-500">

          <Calendar size={16} />

          <span className="text-sm">
            {submittedAt}
          </span>

        </div>

        <span
          className={`
            px-4
            py-2
            rounded-full
            text-xs
            font-semibold
            ${
              badgeStyle[status] ||
              "bg-green-100 text-green-700"
            }
          `}
        >
          {status}
        </span>

      </div>

    </div>
  );
}