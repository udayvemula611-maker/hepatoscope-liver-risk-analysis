import { ReportInput } from '../types/report';

export function calculateRisk(values: ReportInput): { score: number; level: string } {
    let score = 0;

    // Rule-based logic for Liver Function Tests (LFT)

    // Total Bilirubin (Normal: 0.1 - 1.2 mg/dL)
    if (values.total_bilirubin > 1.2 && values.total_bilirubin <= 2.0) score += 2;
    else if (values.total_bilirubin > 2.0) score += 4;

    // SGPT / ALT (Normal: 7 - 56 U/L)
    if (values.sgpt > 56 && values.sgpt <= 100) score += 1;
    else if (values.sgpt > 100 && values.sgpt <= 200) score += 3;
    else if (values.sgpt > 200) score += 5;

    // SGOT / AST (Normal: 8 - 48 U/L)
    if (values.sgot > 48 && values.sgot <= 100) score += 1;
    else if (values.sgot > 100 && values.sgot <= 200) score += 3;
    else if (values.sgot > 200) score += 5;

    // Albumin (Normal: 3.5 - 5.0 g/dL)
    // Low albumin indicates poor liver function
    if (values.albumin < 3.5 && values.albumin >= 2.8) score += 3;
    else if (values.albumin < 2.8) score += 5;

    // Determine Risk Level based on cumulative score
    let level = "Low";
    if (score >= 4 && score <= 8) {
        level = "Moderate";
    } else if (score > 8) {
        level = "High";
    }

    return { score, level };
}
