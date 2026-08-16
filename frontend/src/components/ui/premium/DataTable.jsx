import EmptyState from "./EmptyState";

export default function DataTable({
  columns = [],
  data = [],
  emptyTitle = "No Data Found",
  emptyDescription = "There is nothing to display yet.",
}) {
  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div
      className="
        overflow-hidden
        rounded-[28px]
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      <div className="overflow-x-auto">

        <table className="w-full">

          {/* Header */}

          <thead className="bg-slate-50 border-b border-slate-200">

            <tr>

              {columns.map((column) => (

                <th
                  key={column.key}
                  className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-bold
                    text-slate-600
                    whitespace-nowrap
                  "
                >
                  {column.title}
                </th>

              ))}

            </tr>

          </thead>

          {/* Body */}

          <tbody>

            {data.map((row, index) => (

              <tr
                key={row.id || index}
                className="
                  border-b
                  border-slate-100
                  hover:bg-slate-50
                  transition
                "
              >

                {columns.map((column) => (

                  <td
                    key={column.key}
                    className="
                      px-6
                      py-5
                      text-slate-700
                      whitespace-nowrap
                    "
                  >

                    {column.render
                      ? column.render(row)
                      : row[column.key]}

                  </td>

                ))}

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}