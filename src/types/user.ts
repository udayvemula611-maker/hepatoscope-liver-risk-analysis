export type Role = 'admin' | 'doctor' | 'patient';

export interface UserProfile {
    id: string;
    full_name: string | null;
    role: Role;
    created_at: string;
}
