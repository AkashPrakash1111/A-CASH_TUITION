import React from "react";
import Button from "../ui/Button";

export default function TeacherTable({
  teachers,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">

      <table className="w-full">

        <thead className="bg-gray-100">

          <tr>

            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Subject
            </th>

            <th className="p-4 text-left">
              Phone
            </th>

            <th className="p-4 text-left">
              Qualification
            </th>

            <th className="p-4 text-left">
              Experience
            </th>

            <th className="p-4 text-left">
              Status
            </th>

            <th className="p-4 text-center">
              Actions
            </th>

          </tr>

        </thead>

        <tbody>

          {teachers.length === 0 ? (

            <tr>

              <td
                colSpan={7}
                className="text-center py-10 text-gray-500"
              >
                No Teachers Found
              </td>

            </tr>

          ) : (

            teachers.map((teacher) => (

              <tr
                key={teacher.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-4 font-medium">
                  {teacher.name}
                </td>

                <td className="p-4">
                  {teacher.subject}
                </td>

                <td className="p-4">
                  {teacher.phone}
                </td>

                <td className="p-4">
                  {teacher.qualification}
                </td>

                <td className="p-4">
                  {teacher.experience}
                </td>

                <td className="p-4">

                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      teacher.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {teacher.status}
                  </span>

                </td>

                <td className="p-4">

                  <div className="flex justify-center gap-2">

                    <Button
                      size="sm"
                      variant="warning"
                      onClick={() => onEdit(teacher)}
                    >
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        onDelete(teacher.id)
                      }
                    >
                      Delete
                    </Button>

                  </div>

                </td>

              </tr>

            ))

          )}

        </tbody>

      </table>

    </div>
  );
}