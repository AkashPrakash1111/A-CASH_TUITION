import React from "react";
import Button from "../ui/Button";
import {
  Pencil,
  Trash2,
} from "lucide-react";

export default function BatchTable({
  batches,
  onEdit,
  onDelete,
}) {
  if (batches.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-16 text-center border border-gray-200">

        <h2 className="text-2xl font-bold text-gray-700">
          No Batches Found
        </h2>

        <p className="text-gray-500 mt-3">
          Click <strong>Add Batch</strong> to create your first batch.
        </p>

      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-50">

          <tr>

            <th className="text-left p-5">Batch</th>

            <th className="text-left p-5">Class</th>

            <th className="text-left p-5">Subject</th>

            <th className="text-left p-5">Teacher</th>

            <th className="text-left p-5">Time</th>

            <th className="text-left p-5">Students</th>

            <th className="text-left p-5">Status</th>

            <th className="text-center p-5">Actions</th>

          </tr>

        </thead>

        <tbody>

          {batches.map((batch) => (

            <tr
              key={batch.id}
              className="border-t hover:bg-gray-50 transition"
            >

              <td className="p-5 font-semibold">
                {batch.batchName}
              </td>

              <td className="p-5">
                {batch.className}
              </td>

              <td className="p-5">
                {batch.subject}
              </td>

              <td className="p-5">
                {batch.teacher}
              </td>

              <td className="p-5">
                {batch.time}
              </td>

              <td className="p-5">
                {batch.enrolled}/{batch.capacity}
              </td>

              <td className="p-5">

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-sm
                    font-medium
                    ${
                      batch.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }
                  `}
                >
                  {batch.status}
                </span>

              </td>

              <td className="p-5">

                <div className="flex justify-center gap-2">

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(batch)}
                  >
                    <Pencil size={16} />
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(batch.id)}
                  >
                    <Trash2 size={16} />
                  </Button>

                </div>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}