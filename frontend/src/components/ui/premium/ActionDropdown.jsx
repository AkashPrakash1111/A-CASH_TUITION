import { useEffect, useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  Pencil,
  Copy,
  Download,
  Archive,
  Trash2,
} from "lucide-react";

export default function ActionDropdown({
  onView,
  onEdit,
  onDuplicate,
  onDownload,
  onArchive,
  onDelete,
}) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
  }, []);

  const actions = [
    {
      label: "View",
      icon: Eye,
      onClick: onView,
    },
    {
      label: "Edit",
      icon: Pencil,
      onClick: onEdit,
    },
    {
      label: "Duplicate",
      icon: Copy,
      onClick: onDuplicate,
    },
    {
      label: "Download",
      icon: Download,
      onClick: onDownload,
    },
    {
      label: "Archive",
      icon: Archive,
      onClick: onArchive,
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: onDelete,
      danger: true,
    },
  ].filter((action) => action.onClick);

  return (
    <div
      className="relative inline-block"
      ref={menuRef}
    >
      {/* Trigger */}

      <button
        onClick={() => setOpen(!open)}
        className="
          w-10
          h-10
          rounded-xl
          flex
          items-center
          justify-center
          hover:bg-slate-100
          transition
        "
      >
        <MoreVertical size={18} />
      </button>

      {/* Menu */}

      {open && (
        <div
          className="
            absolute
            right-0
            mt-2
            w-56
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            overflow-hidden
            z-50
            animate-in
            fade-in
            zoom-in-95
          "
        >
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={`
                  w-full
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  text-left
                  transition
                  ${
                    action.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "hover:bg-slate-50"
                  }
                `}
              >
                <Icon size={18} />

                <span className="font-medium">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}