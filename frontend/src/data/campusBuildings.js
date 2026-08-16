import {
  LibraryBig,
  GraduationCap,
  Users,
  ClipboardList,
  FileCheck2,
  BrainCircuit,
  Video,
  BarChart3,
  ShieldCheck,
} from "lucide-react";

const campusBuildings = [
  {
    id: "library",

    title: "Knowledge Library",

    description:
      "Manage notes, PDFs, textbooks and learning resources.",

    route: "/admin/notes",

    icon: LibraryBig,

    color: "#3B82F6",

    gradient: "from-blue-500 to-cyan-400",

    stats: {
      primary: "128 Notes",
      secondary: "42 PDFs",
      tertiary: "16 New Today",
    },

    liveActivity: "12 students uploaded notes today",

    avatars: [],

    status: "active",
  },

  {
    id: "faculty",

    title: "Faculty Hub",

    description:
      "Manage teachers, faculty profiles and subjects.",

    route: "/admin/teachers",

    icon: GraduationCap,

    color: "#10B981",

    gradient: "from-emerald-500 to-green-400",

    stats: {
      primary: "18 Teachers",
      secondary: "14 Subjects",
      tertiary: "6 Online",
    },

    liveActivity: "3 teachers are currently teaching",

    avatars: [],

    status: "active",
  },

  {
    id: "students",

    title: "Student Commons",

    description:
      "View students, batches, achievements and progress.",

    route: "/admin/students",

    icon: Users,

    color: "#F97316",

    gradient: "from-orange-500 to-amber-400",

    stats: {
      primary: "324 Students",
      secondary: "12 Batches",
      tertiary: "58 Online",
    },

    liveActivity: "24 students joined today",

    avatars: [],

    status: "active",
  },

  {
    id: "assignments",

    title: "Assignment Studio",

    description:
      "Create assignments and review student submissions.",

    route: "/admin/assignments",

    icon: ClipboardList,

    color: "#8B5CF6",

    gradient: "from-violet-500 to-purple-500",

    stats: {
      primary: "46 Assignments",
      secondary: "12 Pending",
      tertiary: "28 Reviewed",
    },

    liveActivity: "8 assignments submitted today",

    avatars: [],

    status: "active",
  },

  {
    id: "exams",

    title: "Examination Centre",

    description:
      "Manage mock tests, exams and student results.",

    route: "/admin/exams",

    icon: FileCheck2,

    color: "#EF4444",

    gradient: "from-red-500 to-rose-500",

    stats: {
      primary: "16 Exams",
      secondary: "4 Upcoming",
      tertiary: "92% Completion",
    },

    liveActivity: "Mock Test starts in 2 hours",

    avatars: [],

    status: "upcoming",
  },

  {
    id: "ai",

    title: "AI Research Center",

    description:
      "Generate notes, lesson plans, papers and insights using AI.",

    route: "/admin/ai-studio",

    icon: BrainCircuit,

    color: "#06B6D4",

    gradient: "from-cyan-500 to-sky-500",

    stats: {
      primary: "218 AI Tasks",
      secondary: "98 Questions",
      tertiary: "42 Notes Created",
    },

    liveActivity: "AI generated 14 lesson plans today",

    avatars: [],

    status: "active",
  },

  {
    id: "live",

    title: "Live Learning Arena",

    description:
      "Conduct live classes and manage recordings.",

    route: "/admin/live-classes",

    icon: Video,

    color: "#6366F1",

    gradient: "from-indigo-500 to-blue-500",

    stats: {
      primary: "9 Live Classes",
      secondary: "3 Running",
      tertiary: "112 Students",
    },

    liveActivity: "Physics class is live now",

    avatars: [],

    status: "live",
  },

  {
    id: "analytics",

    title: "Analytics Center",

    description:
      "Monitor performance, growth and academic insights.",

    route: "/admin/analytics",

    icon: BarChart3,

    color: "#14B8A6",

    gradient: "from-teal-500 to-cyan-500",

    stats: {
      primary: "92% Success",
      secondary: "18 Reports",
      tertiary: "Weekly Growth",
    },

    liveActivity: "Performance updated 5 minutes ago",

    avatars: [],

    status: "active",
  },

  {
    id: "admin",

    title: "Administration Office",

    description:
      "System settings, permissions and institution management.",

    route: "/admin/settings",

    icon: ShieldCheck,

    color: "#64748B",

    gradient: "from-slate-500 to-slate-400",

    stats: {
      primary: "12 Roles",
      secondary: "48 Permissions",
      tertiary: "System Healthy",
    },

    liveActivity: "All services are operational",

    avatars: [],

    status: "active",
  },
];

export default campusBuildings;