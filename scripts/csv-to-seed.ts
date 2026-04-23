/**
 * csv-to-seed.ts
 * Reads data/patients.csv, data/visits.csv, data/followups.csv
 * and overwrites supabase/seed.sql with proper INSERT statements.
 *
 * Usage:
 *   npx tsx scripts/csv-to-seed.ts
 *
 * Place your CSV files in the /data folder at the project root.
 */

import * as fs from 'fs';
import * as path from 'path';

// ─── CSV parser (handles quoted fields & embedded commas) ────────────────────

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote inside quoted field
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseCSV(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]).map(h => h.trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = parseCSVLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = (values[idx] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

// ─── SQL value helpers ───────────────────────────────────────────────────────

function sqlStr(val: string): string {
  if (val === '' || val.toLowerCase() === 'null') return 'null';
  return `'${val.replace(/'/g, "''")}'`;
}

function sqlJsonb(val: string): string {
  if (val === '' || val.toLowerCase() === 'null') return 'null';
  return `'${val.replace(/'/g, "''")}'::jsonb`;
}

function sqlBool(val: string): string {
  if (val === '' || val.toLowerCase() === 'null') return 'null';
  return val.toLowerCase() === 'true' ? 'true' : 'false';
}

function sqlNum(val: string): string {
  if (val === '' || val.toLowerCase() === 'null') return 'null';
  return val;
}

// ─── Read CSVs ───────────────────────────────────────────────────────────────

const dataDir = path.join(process.cwd(), 'data');

function readCSV(filename: string): Record<string, string>[] {
  const filepath = path.join(dataDir, filename);
  if (!fs.existsSync(filepath)) {
    console.error(`❌ Missing file: ${filepath}`);
    process.exit(1);
  }
  return parseCSV(fs.readFileSync(filepath, 'utf-8'));
}

const patients  = readCSV('patients.csv');
const visits    = readCSV('visits.csv');
const followups = readCSV('followups.csv');

// ─── Generate SQL ────────────────────────────────────────────────────────────

let sql = `-- Auto-generated seed. DO NOT EDIT MANUALLY.
-- Source: data/patients.csv, data/visits.csv, data/followups.csv
-- Regenerate: npx tsx scripts/csv-to-seed.ts
--
-- Idempotent: truncate + insert. Safe to re-run during Supabase bring-up.

begin;

truncate table corrections, followups, visits, patients restart identity cascade;

-- ─── patients (${patients.length} rows) ────────────────────────────────────────────────────
insert into patients (id, name, species, breed, age_years, sex, owner_name, owner_phone, owner_telegram) values
`;

sql += patients
  .map(
    p =>
      `  (${sqlStr(p.id)}, ${sqlStr(p.name)}, ${sqlStr(p.species)}, ${sqlStr(p.breed)}, ` +
      `${sqlNum(p.age_years)}, ${sqlStr(p.sex)}, ${sqlStr(p.owner_name)}, ${sqlStr(p.owner_phone)}, ${sqlStr(p.owner_telegram)})`
  )
  .join(',\n');
sql += ';\n\n';

sql += `-- ─── visits (${visits.length} rows) ────────────────────────────────────────────────────────
insert into visits (id, patient_id, visit_date, raw_notes, soap_note) values
`;

sql += visits
  .map(
    v =>
      `  (${sqlStr(v.id)}, ${sqlStr(v.patient_id)}, ${sqlStr(v.visit_date)}, ` +
      `${sqlStr(v.raw_notes)}, ${sqlStr(v.soap_note)})`
  )
  .join(',\n');
sql += ';\n\n';

sql += `-- ─── followups (${followups.length} rows) ──────────────────────────────────────────────────
insert into followups (
  id, visit_id, scheduled_at, sent_at, status,
  owner_message, glm_decision, confidence, differentials, draft_response, recommended_action, doctor_approved
) values
`;

sql += followups
  .map(
    f =>
      `  (${sqlStr(f.id)}, ${sqlStr(f.visit_id)}, ${sqlStr(f.scheduled_at)}, ${sqlStr(f.sent_at)}, ${sqlStr(f.status)},\n` +
      `   ${sqlStr(f.owner_message)}, ${sqlStr(f.glm_decision)}, ${sqlNum(f.confidence)}, ` +
      `${sqlJsonb(f.differentials)}, ${sqlStr(f.draft_response)}, ${sqlStr(f.recommended_action)}, ${sqlBool(f.doctor_approved)})`
  )
  .join(',\n');
sql += ';\n\ncommit;\n';

// ─── Write seed.sql ──────────────────────────────────────────────────────────

const seedPath = path.join(process.cwd(), 'supabase', 'seed.sql');
fs.writeFileSync(seedPath, sql, 'utf-8');

console.log(`✅ seed.sql written:`);
console.log(`   ${patients.length} patients`);
console.log(`   ${visits.length} visits`);
console.log(`   ${followups.length} followups`);
console.log(`\nNext: npx supabase db reset`);
