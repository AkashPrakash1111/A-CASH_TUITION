import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
} from "lucide-react";

export default function FolderExplorer({
  title = "Folders",
  items = [],
  selectedItem,
  onSelect,
}) {
  return (
    <div className="bg-white rounded-[28px] border border-slate-200 shadow-sm overflow-hidden">

      {/* Header */}

      <div className="px-6 py-5 border-b border-slate-100">

        <h2 className="text-lg font-bold text-slate-800">
          {title}
        </h2>

      </div>

      {/* Folder List */}

      <div className="p-3 space-y-2">

        {items.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            No items found
          </div>
        ) : (
          items.map((item) => {
            const active = item === selectedItem;

            return (
              <button
                key={item}
                onClick={() => onSelect(item)}
                className={`
                  w-full
                  flex
                  items-center
                  justify-between
                  rounded-2xl
                  px-4
                  py-4
                  transition-all
                  duration-300
                  ${
                    active
                      ? "bg-[#008388] text-white shadow-lg"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                <div className="flex items-center gap-3">

                  {active ? (
                    <FolderOpen size={22} />
                  ) : (
                    <Folder size={22} />
                  )}

                  <span className="font-medium">
                    {item}
                  </span>

                </div>

                {active ? (
                  <ChevronDown size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}

              </button>
            );
          })
        )}

      </div>

    </div>
  );
}