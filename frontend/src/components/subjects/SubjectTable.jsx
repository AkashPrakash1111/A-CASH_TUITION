import Button from "../ui/Button";

export default function SubjectTable({
  subjects,
  onEdit,
  onDelete,
}) {
  if (subjects.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
        No subjects found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-4">Subject</th>
            <th className="text-left p-4">Class</th>
            <th className="text-left p-4">Teacher</th>
            <th className="text-left p-4">Status</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {subjects.map((subject) => (
            <tr
              key={subject.id}
              className="border-t hover:bg-gray-50"
            >
              <td className="p-4 font-medium">
                {subject.name}
              </td>

              <td className="p-4">
                {subject.className}
              </td>

              <td className="p-4">
                {subject.teacher}
              </td>

              <td className="p-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    subject.status === "Active"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {subject.status}
                </span>
              </td>

              <td className="p-4">
                <div className="flex justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onEdit(subject)}
                  >
                    Edit
                  </Button>

                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onDelete(subject.id)}
                  >
                    Delete
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