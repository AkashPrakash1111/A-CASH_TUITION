export const campusLayout = {
  administration: {
    title: "Administration",
    subtitle: "Settings",
    route: "/admin/settings",

    building: {
      top: "17%",
      left: "16%",
      width: "16%",
      zIndex: 20,
    },

    label: {
      top: "4%",
      left: "15%",
    },
  },

  analytics: {
    title: "Analytics Centre",
    subtitle: "Reports",
    route: "/admin/analytics",

    building: {
      top: "17%",
      left: "85%",
      width: "16%",
      zIndex: 20,
    },

    label: {
      top: "4%",
      left: "85%",
    },
  },

  ai: {
    title: "AI Research Lab",
    subtitle: "AI Tutor",
    route: "/admin/ai-studio",

    building: {
      top: "20%",
      left: "38%",
      width: "17%",
      zIndex: 24,
    },

    label: {
      top: "4%",
      left: "35%",
    },
  },

  library: {
    title: "Knowledge Library",
    subtitle: "Notes & Resources",
    route: "/admin/notes",

    building: {
      top: "20%",
      left: "63%",
      width: "17%",
      zIndex: 24,
    },

    label: {
      top: "4%",
      left: "65%",
    },
  },

  faculty: {
    title: "Faculty Hub",
    subtitle: "Teachers",
    route: "/admin/teachers",

    building: {
      top: "48%",
      left: "25%",
      width: "17%",
      zIndex: 22,
    },

    label: {
      top: "35%",
      left: "25%",
    },
  },

  live: {
    title: "Live Learning Arena",
    subtitle: "Live Classes",
    route: "/admin/live-classes",

    building: {
      top: "48%",
      left: "75%",
      width: "18%",
      zIndex: 22,
    },

    label: {
      top: "35%",
      left: "75%",
    },
  },

  exams: {
    title: "Examination Centre",
    subtitle: "Mock Tests",
    route: "/admin/exams",

    building: {
      top: "62%",
      left: "15%",
      width: "17%",
      zIndex: 21,
    },

    label: {
      top: "50%",
      left: "12%",
    },
  },

  students: {
    title: "Student Commons",
    subtitle: "Students",
    route: "/admin/students",

    building: {
      top: "62%",
      left: "85%",
      width: "17%",
      zIndex: 21,
    },

    label: {
      top: "50%",
      left: "90%",
    },
  },

  assignments: {
    title: "Assignment Studio",
    subtitle: "Assignments",
    route: "/admin/assignments",

    building: {
      top: "73%",
      left: "49%",
      width: "17%",
      zIndex: 23,
    },

    label: {
      top: "60%",
      left: "50%",
    },
  },
};

export function getBuildingRoute(key, role = "admin") {
  const routes = {
    admin: {
      administration: "/admin/settings",
      analytics: "/admin/analytics",
      ai: "/admin/ai-studio",
      library: "/admin/notes",
      faculty: "/admin/teachers",
      live: "/admin/live-classes",
      exams: "/admin/exams",
      students: "/admin/students",
      assignments: "/admin/assignments",
    },
    student: {
      administration: "/student/settings",
      analytics: "/student/progress",
      ai: "/student/ai-studio",
      library: "/student/notes",
      faculty: "/student/teachers",
      live: "/student/live-classes",
      exams: "/student/exams",
      students: "/student/friends",
      assignments: "/student/assignments",
    },
    teacher: {
      administration: "/teacher/settings",
      analytics: "/teacher/analytics",
      ai: "/teacher/ai-studio",
      library: "/teacher/notes",
      faculty: "/teacher/subjects",
      live: "/teacher/live-classes",
      exams: "/teacher/exams",
      students: "/teacher/students",
      assignments: "/teacher/assignments",
    },
  };
  return routes[role]?.[key] || routes.admin[key] || "/admin/dashboard";
}

// Support both import styles.
export default campusLayout;