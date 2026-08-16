/**
 * ==========================================================
 * ACASH Avatar Engine
 * ----------------------------------------------------------
 * Central engine for managing all digital citizens.
 * Never access avatarData directly from UI components.
 * ==========================================================
 */

import avatarData from "./avatarData";
import avatarRoles from "./avatarRoles";
import avatarStatus from "./avatarStatus";
import avatarBadges from "./avatarBadges";

class AvatarEngine {
  /* =======================================================
   * Avatar Generator
   * ======================================================= */

  static getAvatar(seed) {
    return `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
      seed
    )}`;
  }

  /* =======================================================
   * Individual Collections
   * ======================================================= */

  static getStudents() {
    return avatarData.students.map((student) => ({
      ...student,
      avatar: this.getAvatar(student.avatarSeed),
    }));
  }

  static getTeachers() {
    return avatarData.teachers.map((teacher) => ({
      ...teacher,
      avatar: this.getAvatar(teacher.avatarSeed),
    }));
  }

  static getParents() {
    return avatarData.parents.map((parent) => ({
      ...parent,
      avatar: this.getAvatar(parent.avatarSeed),
    }));
  }

  static getAdmins() {
    return avatarData.admins.map((admin) => ({
      ...admin,
      avatar: this.getAvatar(admin.avatarSeed),
    }));
  }

  static getAI() {
    return {
      ...avatarData.ai,
      avatar: this.getAvatar(avatarData.ai.avatarSeed),
    };
  }

  /* =======================================================
   * Lookup
   * ======================================================= */

  static getUserById(id) {
    const users = [
      ...this.getStudents(),
      ...this.getTeachers(),
      ...this.getParents(),
      ...this.getAdmins(),
      this.getAI(),
    ];

    return users.find((user) => user.id === id);
  }

  /* =======================================================
   * Dashboard Helpers
   * ======================================================= */

  static getTopPerformers(limit = 5) {
    return this.getStudents()
      .sort((a, b) => b.progress - a.progress)
      .slice(0, limit);
  }

  static getRecentStudents(limit = 5) {
    return this.getStudents().slice(0, limit);
  }

  static getOnlineUsers() {
    return [
      ...this.getStudents(),
      ...this.getTeachers(),
      ...this.getParents(),
      ...this.getAdmins(),
      this.getAI(),
    ].filter((user) => user.status === "online");
  }

  /* =======================================================
   * Building Helpers
   * ======================================================= */

  static getBuildingAvatars(buildingId) {
    switch (buildingId) {
      case "library":
        return this.getStudents().slice(0, 5);

      case "faculty":
        return this.getTeachers();

      case "students":
        return this.getStudents().slice(0, 5);

      case "assignments":
        return this.getStudents().slice(0, 5);

      case "exams":
        return this.getStudents().slice(0, 5);

      case "live":
        return [
          ...this.getTeachers().slice(0, 2),
          ...this.getStudents().slice(0, 3),
        ];

      case "analytics":
        return this.getTopPerformers(5);

      case "ai":
        return [this.getAI()];

      case "admin":
        return this.getAdmins();

      default:
        return [];
    }
  }

  /* =======================================================
   * Metadata Helpers
   * ======================================================= */

  static getRole(role) {
    return avatarRoles[role];
  }

  static getStatus(status) {
    return avatarStatus[status];
  }

  static getBadge(badge) {
    return avatarBadges[badge];
  }

  /* =======================================================
   * Statistics
   * ======================================================= */

  static getCounts() {
    return {
      students: avatarData.students.length,
      teachers: avatarData.teachers.length,
      parents: avatarData.parents.length,
      admins: avatarData.admins.length,
      online: this.getOnlineUsers().length,
    };
  }

  static searchUsers(query) {
    const text = query.toLowerCase();

    return [
      ...this.getStudents(),
      ...this.getTeachers(),
      ...this.getParents(),
      ...this.getAdmins(),
    ].filter((user) =>
      user.name.toLowerCase().includes(text)
    );
  }
}

export default AvatarEngine;