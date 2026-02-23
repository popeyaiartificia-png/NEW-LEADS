
const fs = require('fs');
const path = require('path');

// Extract URL and ANON_KEY from js/supabase.js (Basic regex parsing)
const supabaseConfigPath = path.join(__dirname, 'js', 'supabase.js');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const configContent = fs.readFileSync(supabaseConfigPath, 'utf8');
    const urlMatch = configContent.match(/const SUPABASE_URL = '(.*?)';/);
    const keyMatch = configContent.match(/const SUPABASE_ANON_KEY = '(.*?)';/);

    if (urlMatch) supabaseUrl = urlMatch[1];
    if (keyMatch) supabaseKey = keyMatch[1];
} catch (e) {
    console.error('Error reading supabase.js:', e);
    process.exit(1);
}

// Token provided by user for administrative access 
const supabaseAdminKey = 'sbp_229bd95e31cb6a03e250d49c24e108c7f7936a81';

async function migrate() {
    console.log('Starting migration to dynamic pipeline stages...');

    // We cannot execute arbitrary DDL via standard Supabase JS client unless using RPC or Admin API.
    // However, since we simply need to run the SQL, we can construct the SQL commands and see what 
    // permissions we have, or simply output them for the user if direct execution fails.

    // Since SQL endpoints are often disabled for the anon key, we'll try to use the REST API
    // by making a POST request directly if we can't use the client.

    // The easiest and safest way to perform a direct SQL migration programmatically 
    // against Supabase when bypassing standard constraints is to use the `pg` driver if we had the 
    // connection string, but we only have a personal access token and the URL.

    console.log('Please execute the following SQL snippet in the Supabase SQL Editor:');

    const sqlScript = `
-- 1. Create the new pipeline_stages table
CREATE TABLE pipeline_stages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT DEFAULT '#3b82f6',
    emoji TEXT DEFAULT '📌',
    list_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Insert the default stages
INSERT INTO pipeline_stages (name, color, emoji, list_order) VALUES
    ('New', '#3b82f6', '🆕', 0),
    ('Contacted', '#8b5cf6', '📞', 1),
    ('Follow Up', '#f59e0b', '📅', 2),
    ('Interested', '#ef4444', '🔥', 3),
    ('Qualified', '#10b981', '⭐', 4),
    ('Converted', '#22c55e', '🎉', 5),
    ('Lost', '#6b7280', '❌', 6);

-- 3. Remove the hardcoded status constraint on leads table
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- 4. Set up Row Level Security (RLS) for pipeline_stages
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON pipeline_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON pipeline_stages FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON pipeline_stages FOR DELETE USING (true);
`;

    console.log(sqlScript);

    // Write it to a file for convenience
    fs.writeFileSync(path.join(__dirname, 'pipeline-stage-migration.sql'), sqlScript);
    console.log('Migration script generated as pipeline-stage-migration.sql');
}

migrate();
