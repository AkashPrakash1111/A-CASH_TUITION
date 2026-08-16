/**
 * ==========================================================
 * ACASH Character Registry
 * ----------------------------------------------------------
 * Master list of all digital citizens inside ACASH.
 * Every page should use this instead of hardcoded users.
 * ==========================================================
 */

const avatarData = {

  /* ===================================================== */
  /* STUDENTS */
  /* ===================================================== */

  students: [

    {
      id: "ST001",

      name: "Aarav Nair",

      role: "student",

      className: "10",

      batch: "Morning Science",

      status: "studying",

      badge: "topper",

      streak: 28,

      avatarSeed: "aarav-nair",

      favoriteSubject: "Physics",

      progress: 92,

      mood: "happy",
    },

    {
      id: "ST002",

      name: "Meera Krishnan",

      role: "student",

      className: "10",

      batch: "Morning Science",

      status: "online",

      badge: "active",

      streak: 16,

      avatarSeed: "meera-krishnan",

      favoriteSubject: "Biology",

      progress: 88,

      mood: "focused",
    },

    {
      id: "ST003",

      name: "Rahul Menon",

      role: "student",

      className: "9",

      batch: "Evening Mathematics",

      status: "offline",

      badge: "streak",

      streak: 44,

      avatarSeed: "rahul-menon",

      favoriteSubject: "Math",

      progress: 81,

      mood: "calm",
    },

    {
      id: "ST004",

      name: "Diya Joseph",

      role: "student",

      className: "11",

      batch: "Weekend NEET",

      status: "studying",

      badge: "perfect",

      streak: 52,

      avatarSeed: "diya-joseph",

      favoriteSubject: "Chemistry",

      progress: 95,

      mood: "confident",
    },

  ],

  /* ===================================================== */
  /* TEACHERS */
  /* ===================================================== */

  teachers: [

    {
      id: "TC001",

      name: "Priya Sharma",

      role: "teacher",

      subject: "Physics",

      status: "teaching",

      badge: "mentor",

      avatarSeed: "priya-sharma",

      experience: "8 Years",

      mood: "teaching",
    },

    {
      id: "TC002",

      name: "David Mathew",

      role: "teacher",

      subject: "Mathematics",

      status: "online",

      badge: "mentor",

      avatarSeed: "david-mathew",

      experience: "10 Years",

      mood: "happy",
    },

  ],

  /* ===================================================== */
  /* PARENTS */
  /* ===================================================== */

  parents: [

    {
      id: "PT001",

      name: "Anita Nair",

      role: "parent",

      status: "online",

      avatarSeed: "anita-nair",

      child: "Aarav Nair",

      mood: "happy",
    },

  ],

  /* ===================================================== */
  /* ADMIN */
  /* ===================================================== */

  admins: [

    {
      id: "AD001",

      name: "Akash",

      role: "admin",

      status: "online",

      avatarSeed: "akash",

      mood: "focused",
    },

  ],

  /* ===================================================== */
  /* AI */
  /* ===================================================== */

  ai: {

    id: "AI001",

    name: "ACASH AI",

    role: "ai",

    status: "online",

    avatarSeed: "acash-ai",

    mood: "smart",
  }

};

export default avatarData;