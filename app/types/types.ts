import {Timestamp} from "@google-cloud/firestore";

export interface User {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  createdAt: Timestamp;
  deletedAt?: Timestamp;
}

export type UserDataOnRegister = Pick<User,"firstName" | "lastName" > & Partial<User>

