import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const testData = [
  { age: 65, gender: 'Female', total_bilirubin: 0.7, alk_phosphate: 187, sgpt: 16, sgot: 18, albumin: 3.3, dataset_label: 1 },
  { age: 62, gender: 'Male', total_bilirubin: 10.9, alk_phosphate: 699, sgpt: 64, sgot: 100, albumin: 3.2, dataset_label: 1 },
  { age: 62, gender: 'Male', total_bilirubin: 7.3, alk_phosphate: 490, sgpt: 60, sgot: 68, albumin: 3.3, dataset_label: 1 },
  { age: 58, gender: 'Male', total_bilirubin: 1.0, alk_phosphate: 182, sgpt: 14, sgot: 20, albumin: 3.4, dataset_label: 1 },
  { age: 72, gender: 'Male', total_bilirubin: 3.9, alk_phosphate: 195, sgpt: 27, sgot: 59, albumin: 2.4, dataset_label: 1 }
];

async function importTestData() {
  console.log('🚀 Starting ILPD Test Data Import...');

  // Use the first patient and doctor found in the system
  const { data: profiles } = await supabase.from('profiles').select('*').limit(10);
  const doctor = profiles.find(p => p.role === 'admin' || p.role === 'doctor');
  const patient = profiles.find(p => p.role === 'patient');

  if (!doctor || !patient) {
    console.error('Could not find a valid doctor/patient pair for testing');
    return;
  }

  console.log(`Using Doctor: ${doctor.full_name} (${doctor.id})`);
  console.log(`Using Patient: ${patient.full_name} (${patient.id})`);

  for (const row of testData) {
    // Simple mock calculation for risk score (re-simulating business logic)
    const risk_score = Math.round(Math.min(row.total_bilirubin * 2 + (row.sgpt + row.sgot) / 20 + (row.dataset_label === 1 ? 5 : 0), 50));
    const risk_level = risk_score > 35 ? 'High' : risk_score > 20 ? 'Moderate' : 'Low';

    const report = {
      doctor_id: doctor.id,
      patient_id: patient.id,
      patient_name: `ILPD-Test-${row.age}${row.gender[0]}-${row.dataset_label}`,
      age: row.age,
      gender: row.gender,
      total_bilirubin: row.total_bilirubin,
      alk_phosphate: row.alk_phosphate,
      sgpt: row.sgpt,
      sgot: row.sgot,
      albumin: row.albumin,
      protime: 14.5,
      fatigue: row.total_bilirubin > 2.0, // Mock indicator
      spiders: row.alk_phosphate > 300,   // Mock indicator
      ascites: row.dataset_label === 1 && row.total_bilirubin > 5.0,
      varices: false,
      steroid: false,
      antivirals: false,
      histology: 'None',
      risk_score,
      risk_level,
      probability_score: risk_score / 50,
      ai_summary: `This is a test report generated from the ILPD dataset (Row: Age ${row.age}, Bilirubin ${row.total_bilirubin}). Risk estimated at ${risk_level}.`
    };

    const { error } = await supabase.from('liver_reports').insert([report]);
    if (error) {
      console.error(`Error inserting row for Age ${row.age}:`, error.message);
    } else {
      console.log(`✅ Inserted report for Age ${row.age}, ${row.gender} (Risk: ${risk_level})`);
    }
  }

  console.log('✨ Import Finished!');
}

importTestData();
