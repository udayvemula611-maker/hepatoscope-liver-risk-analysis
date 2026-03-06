export type Role = 'admin' | 'doctor' | 'patient';

export interface UserProfile {
    id: string;
    full_name: string | null;
    role: Role;
    age: number | null;
    gender: string | null;
    created_at: string;
}
