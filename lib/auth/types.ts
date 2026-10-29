export interface User {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  googleId: string | null;
  emailVerifiedAt: Date | null;
}
export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}
export type AuthResult =
  { user: User; session: Session } | { user: null; session: null };
