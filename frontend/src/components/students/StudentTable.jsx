export default function StudentTable({
  students,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      <table className="w-full">

        <thead className="bg-[#008388] text-white">
          <tr>
            <th className="text-left p-4">Name</th>
            <th className="text-left p-4">Class</th>
            <th className="text-left p-4">Batch</th>
            <th className="text-left p-4">Parent</th>
            <th className="text-left p-4">Phone</th>
            <th className="text-left p-4">Status</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>

        <tbody>

          {students.length === 0 ? (
            <tr>
              <td
                colSpan="7"
                className="text-center p-8 text-gray-500"
              >
                No students found.
              </td>
            </tr>
          ) : (
            students.map((student) => (
              <tr
                key={student.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-4 font-medium">
                  {student.name}
                </td>

                <td className="p-4">
                  {student.className}
                </td>

                <td className="p-4">
                  {student.batch}
                </td>

                <td className="p-4">
                  {student.parent}
                </td>

                <td className="p-4">
                  {student.phone}
                </td>

                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      student.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {student.status}
                  </span>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-2">

                    <button
                      onClick={() => onEdit(student)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600"
                    >
                      ✏ Edit
                    </button>

                    <button
                      onClick={() => onDelete(student.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                    >
                      🗑 Delete
                    </button>

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