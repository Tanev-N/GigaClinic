export enum UserRole {
  ADMIN = 'admin',
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  MANAGER = 'manager'
}

export interface User {
  id: number;
  login: string;
  role: UserRole;
}

export interface UserSchema {
  authData?: User;
  _inited: boolean;
} 