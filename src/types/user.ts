export interface Profile {
  id: string;
  full_name: string;
  email: string;
  avatar: string | null;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar: string | null;
  role: 'user' | 'admin';
}
