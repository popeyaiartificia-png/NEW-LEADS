
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
