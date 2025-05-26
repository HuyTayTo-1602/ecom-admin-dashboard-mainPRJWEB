export type User = {
    name: string | null | undefined;
    email?: string | null | undefined;
    avatar?: string | null | undefined;
    id?: string | null | undefined;
  };
  
export type JWTPayload = {
    user: User;
    exp?: number;
    iat?: number;
    sub?: string;
  }