import { ReportInput } from '../types/report';

export function calculateRisk(values: ReportInput): { score: number; level: string; probability: number } {
    let score = 0;

    // 1. Core Lab Values (3 options per marker)

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
    if (values.albumin < 3.5 && values.albumin >= 2.8) score += 3;
    else if (values.albumin < 2.8 && values.albumin > 0) score += 5;

    // 2. New Advanced Biomarkers

    // Alkaline Phosphatase (Normal: 44 - 147 U/L)
    if (values.alk_phosphate && values.alk_phosphate > 147 && values.alk_phosphate <= 300) score += 2;
    else if (values.alk_phosphate && values.alk_phosphate > 300) score += 4;

    // Prothrombin Time (Normal: 11 - 13.5 seconds)
    if (values.protime && values.protime > 13.5 && values.protime <= 20) score += 2;
    else if (values.protime && values.protime > 20) score += 4;

    // 3. Clinical Symptoms & History (Binary Flags)
    if (values.fatigue) score += 1; // Fatigue is common but non-specific
    if (values.spiders) score += 2; // Spider angioma is a sign of chronic liver disease
    if (values.ascites) score += 5; // Ascites is a major sign of decompensated cirrhosis
    if (values.varices) score += 5; // Varices indicate portal hypertension
    
    // Addictions/Medications
    if (values.steroid) score += 2;
    if (values.antivirals) score += 2;

    // 4. Histology Scoring (Categorical)
    if (values.histology === 'F1') score += 1;
    else if (values.histology === 'F2') score += 2;
    else if (values.histology === 'F3') score += 4;
    else if (values.histology === 'F4') score += 6;

    // 5. Calculate Probability
    // Max theoretical score is now ~50 points
    const maxScore = 50;
    const probability = Math.min(Math.round((score / maxScore) * 100), 100);

    // 6. Determine Adjusted Risk Level
    let level = "Low";
    if (score >= 5 && score <= 15) {
        level = "Moderate";
    } else if (score > 15 && score <= 25) {
        level = "High";
    } else if (score > 25) {
        level = "Critical";
    }

    return { score, level, probability };
}
