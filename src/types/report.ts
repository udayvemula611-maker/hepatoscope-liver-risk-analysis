import { UserProfile } from './user';

export interface LiverReport {
    id: string;
    doctor_id: string;
    patient_id: string;
    patient_name: string;
    age: number;
    gender: string;

    // Lab Values
    total_bilirubin: number;
    sgpt: number;
    sgot: number;
    albumin: number;

    // Enhanced Clinical Features
    alk_phosphate: number;
    protime: number;
    fatigue: boolean;
    spiders: boolean;
    ascites: boolean;
    varices: boolean;
    steroid: boolean;
    antivirals: boolean;
    histology: string;

    // Results
    risk_score: number;
    risk_level: string;
    probability_score: number;
    ai_summary: string;

    created_at: string;
}

export interface ReportInput {
    patient_id?: string;
    patient_name: string;
    age: number;
    gender: string;
    total_bilirubin: number;
    sgpt: number;
    sgot: number;
    albumin: number;

    // New variables
    alk_phosphate?: number;
    protime?: number;
    fatigue?: boolean;
    spiders?: boolean;
    ascites?: boolean;
    varices?: boolean;
    steroid?: boolean;
    antivirals?: boolean;
    histology?: string;
}
