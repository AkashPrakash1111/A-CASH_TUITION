import {
  CheckCircle2,
  Clock3,
  AlertTriangle,
  XCircle,
  PlayCircle,
  PauseCircle,
} from "lucide-react";

const variants = {
  active: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
    label: "Active",
  },

  inactive: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: PauseCircle,
    label: "Inactive",
  },

  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock3,
    label: "Pending",
  },

  approved: {
    bg: "bg-cyan-100",
    text: "text-cyan-700",
    border: "border-cyan-200",
    icon: CheckCircle2,
    label: "Approved",
  },

  rejected: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: XCircle,
    label: "Rejected",
  },

  completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-200",
    icon: CheckCircle2,
    label: "Completed",
  },

  upcoming: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    border: "border-violet-200",
    icon: Clock3,
    label: "Upcoming",
  },

  live: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-200",
    icon: PlayCircle,
    label: "Live",
  },

  warning: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-200",
    icon: AlertTriangle,
    label: "Warning",
  },
};

export default function StatusBadge({
  status = "active",
  text,
  size = "md",
}) {
  const config =
    variants[status.toLowerCase()] ||
    variants.active;

  const Icon = config.icon;

  const sizes = {
    sm: {
      badge: "px-2.5 py-1",
      icon: 14,
      text: "text-xs",
    },

    md: {
      badge: "px-3 py-1.5",
      icon: 16,
      text: "text-sm",
    },

    lg: {
      badge: "px-4 py-2",
      icon: 18,
      text: "text-base",
    },
  };

  const currentSize = sizes[size];

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        font-semibold
        transition-all
        duration-300

        ${config.bg}
        ${config.text}
        ${config.border}

        ${currentSize.badge}
        ${currentSize.text}
      `}
    >
      <Icon size={currentSize.icon} />

      {text || config.label}
    </span>
  );
}