import { int } from "zod";

export interface User {
  id: number;
  email: string;
  name: string;
  householdId?: number | null;
  createdOn: Date;
  updatedOn: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  householdId?: number | null;
}

export interface Household {
  id: number;
  name: string;
  createdOn: Date;
  updatedOn: Date;
}

// --- REPOSITORIES  INTERFACES ---
export interface AuthRepository {
  findUserById(id: number): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  createUser(input: CreateUserInput): Promise<User>;

  verifyCredentials(email: string, password: string): Promise<User | null>;
}
