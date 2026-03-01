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
Analyze the following Liver Function Test (LFT) results for a ${values.age}-year-old ${values.gender}.

Lab Values:
- Total Bilirubin: ${values.total_bilirubin} mg/dL (Normal Range: 0.1 - 1.2 mg/dL)
- SGPT (ALT): ${values.sgpt} U/L (Normal Range: 7 - 56 U/L)
- SGOT (AST): ${values.sgot} U/L (Normal Range: 8 - 48 U/L)
- Albumin: ${values.albumin} g/dL (Normal Range: 3.4 - 5.4 g/dL)

Risk Engine Output:
- Score: ${riskScore}
- Level: ${riskLevel}

Provide a clear, professional, yet understandable summary of these results. 
1. Identify any specific abnormal values and their severity.
2. Outline what these abnormalities might indicate clinically.
3. Suggest general follow-up actions for the physician to consider.

Keep the response cleanly formatted in 3-4 concise paragraphs. Focus strictly on the medical data above. Do not output markdown code blocks or conversational filler.
`;

    try {
        const baseUrl = process.env.OLLAMA_BASE_URL || 'https://ollama.com';
        const apiKey = process.env.OLLAMA_API_KEY || '';

        // Use Official Ollama client
        const ollama = new Ollama({
            host: baseUrl,
            headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined
        });

        // Use standard models depending on environment
        // Defaults to 'llama3' for local Ollama, and 'gpt-oss:120b' if using Ollama Cloud (per documentation)
        const isCloud = baseUrl.includes('ollama.com');
        const model = process.env.OLLAMA_MODEL || (isCloud ? 'gpt-oss:120b' : 'llama3');

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
        console.error("Error connecting to AI service:", error);
        return "Error generating AI explanation. " + (error?.message || "Service unavailable.");
    }
}
