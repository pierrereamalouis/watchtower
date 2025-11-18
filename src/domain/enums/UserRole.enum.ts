export const UserRole = {
  ADMIN: "admin",
  MEMBER: "member",
  USER: "user",
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
