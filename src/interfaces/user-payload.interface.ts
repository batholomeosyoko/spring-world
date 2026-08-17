export interface UserPayload {
  id: string;
  email: string;
  name: string;
  roles?: string[];
  iat?: number;
  exp?: number;
}
