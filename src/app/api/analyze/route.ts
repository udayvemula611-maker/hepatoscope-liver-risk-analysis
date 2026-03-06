import { createClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';
import { calculateRisk } from '@/lib/riskEngine';
import { generateSummary } from '@/lib/ollama';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();

        // Authenticate the session
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Role verification: ensure only Doctors can submit a new analysis.
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'doctor') {
            console.error(`AI: Unauthorized Role. User ${user.id} is a ${profile?.role}.`);
            return NextResponse.json({ error: 'Only doctors can submit liver analysis reports' }, { status: 403 });
        }

        const body = await req.json();
        console.log("AI: Received Request Body:", JSON.stringify(body, null, 2));
        const {
            patient_id,
            total_bilirubin,
            sgpt,
            sgot,
            albumin,
            alk_phosphate,
            protime,
            fatigue,
            spiders,
            ascites,
            varices,
            steroid,
            antivirals,
            histology
        } = body;

        // Fetch patient demographics securely bypassing RLS
        let patient_name = 'Anonymous Patient';
        let age: number | null = null;
        let gender = 'Unknown';

        if (patient_id) {
            const supabaseAdmin = createSupabaseClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!
            );

            const { data: patientProfile, error: profileErr } = await supabaseAdmin.from('profiles').select('full_name, age, gender').eq('id', patient_id).single();
            if (profileErr) {
                console.error("AI: Patient Profile Fetch Error:", profileErr.message);
            } else if (patientProfile) {
                patient_name = patientProfile.full_name || 'Anonymous Patient';
                age = patientProfile.age;
                gender = patientProfile.gender || 'Unknown';
                console.log(`AI: Fetched Demographics for ${patient_id}: Name=${patient_name}, Age=${age}, Gender=${gender}`);
            }
        }

        // Validate inputs
        if (!patient_id || age === null || gender === 'Unknown' || total_bilirubin == null || sgpt == null || sgot == null || albumin == null) {
            const missing = [];
            if (!patient_id) missing.push('patient_id');
            if (age === null) missing.push('age');
            if (gender === 'Unknown') missing.push('gender');
            if (total_bilirubin == null) missing.push('total_bilirubin');
            console.error("AI: Validation Failed. Missing fields:", missing.join(', '));
            return NextResponse.json({ error: `Missing required lab values or Patient demographics not set: ${missing.join(', ')}` }, { status: 400 });
        }

        const fullReportData = {
            ...body,
            patient_name,
            age,
            gender
        };

        // 1. Calculate Risk using Rule-based engine
        const risk = calculateRisk(fullReportData);

        // 2. Generate AI Explanation via Ollama API
        console.log("AI: Starting AI summary generation...");
        const summary = await generateSummary(fullReportData, risk.score, risk.level);
        console.log("AI: Summary generated successfully.");

        // 3. Store record securely in Supabase
        const { data: insertData, error } = await supabase.from('liver_reports').insert({
            doctor_id: user.id,
            patient_id: patient_id || null,
            patient_name,
            age: Number(age),
            gender,
            total_bilirubin: Number(total_bilirubin),
            sgpt: Number(sgpt),
            sgot: Number(sgot),
            albumin: Number(albumin),
            alk_phosphate: alk_phosphate ? Number(alk_phosphate) : null,
            protime: protime ? Number(protime) : null,
            fatigue: !!fatigue,
            spiders: !!spiders,
            ascites: !!ascites,
            varices: !!varices,
            steroid: !!steroid,
            antivirals: !!antivirals,
            histology: histology || 'None',
            risk_score: risk.score,
            risk_level: risk.level,
            ai_summary: summary
        }).select('id').single();

        if (error) {
            console.error("Supabase Insert Error:", error);
            return NextResponse.json({ error: 'Internal database error.' }, { status: 500 });
        }

        // 4. Return success to Frontend
        return NextResponse.json({
            reportId: insertData.id,
            riskScore: risk.score,
            riskLevel: risk.level,
            summary
        });

    } catch (err: any) {
        console.error("Analysis Endpoint Error:", err);
        return NextResponse.json({ error: 'Server error processing the report.' }, { status: 500 });
    }
}
