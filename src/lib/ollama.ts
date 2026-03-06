import { ReportInput } from '../types/report';
import { Ollama } from 'ollama';

export async function generateSummary(
    values: ReportInput,
    riskScore: number,
    riskLevel: string
): Promise<string> {

    // Privacy First: Explicitly omit the patient name from the LLM payload to maintain clinical confidentiality
    const prompt = `
You are an expert hepatologist AI assistant. 
Analyze the following comprehensive Liver Function Profile for a ${values.age}-year-old ${values.gender}.

Primary Biomarkers:
- Total Bilirubin: ${values.total_bilirubin} mg/dL (Normal: 0.1 - 1.2)
- SGPT (ALT): ${values.sgpt} U/L (Normal: 7 - 56)
- SGOT (AST): ${values.sgot} U/L (Normal: 8 - 48)
- Albumin: ${values.albumin} g/dL (Normal: 3.4 - 5.4)

Advanced Markers & History:
- Alk Phosphate: ${values.alk_phosphate || 'N/A'} U/L (Normal: 44 - 147)
- Prothrombin Time: ${values.protime || 'N/A'} s (Normal: 11 - 13.5)
- Medical History: ${[values.steroid ? 'On Steroids' : null, values.antivirals ? 'On Antivirals' : null].filter(Boolean).join(', ') || 'None reported'}

Clinical Symptoms:
- Fatigue: ${values.fatigue ? 'PRESENT' : 'Absent'}
- Spiders: ${values.spiders ? 'PRESENT' : 'Absent'}
- Ascites: ${values.ascites ? 'PRESENT' : 'Absent'}
- Varices: ${values.varices ? 'PRESENT' : 'Absent'}
- Histology: ${values.histology || 'Not Performed'}

Risk Engine Model Output:
- Risk Score: ${riskScore} / 50
- Risk Level: ${riskLevel}
- Probability Score: ${values.alk_phosphate ? Math.round((riskScore / 50) * 100) : 'N/A'}%

Provide a sophisticated, professional medical synthesis. 
1. Correlate clinical symptoms (like Ascites/Varices) with lab abnormalities (Bilirubin/Albumin).
2. Explain the significance of the probability score in the context of these markers.
3. Outline potential differential considerations and specific clinical follow-ups.

Keep the response cleanly formatted in 3-4 concise paragraphs. Focus strictly on the medical data above. Do not output markdown code blocks or conversational filler.
`;

    try {
        const apiKey = process.env.OLLAMA_API_KEY || '';
        const baseUrl = process.env.OLLAMA_BASE_URL || 'https://ollama.com';
        
        console.log(`AI: Connecting to Cloud Ollama (${baseUrl}) using model gpt-oss:120b...`);

        // Use Official Ollama client with Cloud parameters
        const ollama = new Ollama({
            host: baseUrl,
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
        });

        // Use the cloud model as requested
        const model = 'gpt-oss:120b';

        const response = await ollama.chat({
            model: model,
            messages: [
                { role: 'system', content: 'You are a helpful medical assistant for doctors.' },
                { role: 'user', content: prompt }
            ],
            stream: false,
            options: {
                temperature: 0.3
            }
        });

        return response.message?.content?.trim() || "Generated AI summary could not be extracted.";
    } catch (error: any) {
        console.error("AI: Cloud Connectivity Error:", error.message);
        return "Error generating AI explanation. " + (error?.message || "Service unavailable.");
    }
}
