-- Supabase SQL Schema for Lead Management System
-- Run this in your Supabase SQL Editor to create the required tables
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- =============================================
-- LEADS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    source TEXT CHECK (
        source IN (
            'Facebook',
            'Instagram',
            'WhatsApp',
            'Website',
            'Referral',
            'Walk-in',
            'Phone Call',
            'Other'
        )
    ),
    status TEXT DEFAULT 'New' CHECK (
        status IN (
            'New',
            'Contacted',
            'Interested',
            'Qualified',
            'Converted',
            'Lost'
        )
    ),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
-- =============================================
-- FOLLOWUPS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS followups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    followup_date DATE NOT NULL,
    followup_time TIME,
    priority TEXT DEFAULT 'Medium' CHECK (priority IN ('High', 'Medium', 'Low')),
    reminder_days INTEGER DEFAULT 1 CHECK (
        reminder_days >= 0
        AND reminder_days <= 30
    ),
    description TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed', 'Cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_followups_lead_id ON followups(lead_id);
CREATE INDEX IF NOT EXISTS idx_followups_date ON followups(followup_date);
CREATE INDEX IF NOT EXISTS idx_followups_status ON followups(status);
CREATE INDEX IF NOT EXISTS idx_followups_priority ON followups(priority);
-- =============================================
-- ROW LEVEL SECURITY (Optional - Enable if needed)
-- =============================================
-- Uncomment the following lines if you want to enable RLS
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
-- -- Allow all operations for authenticated users (adjust as needed)
-- CREATE POLICY "Allow all operations on leads" ON leads
--     FOR ALL USING (true) WITH CHECK (true);
-- CREATE POLICY "Allow all operations on followups" ON followups
--     FOR ALL USING (true) WITH CHECK (true);
-- =============================================
-- SAMPLE DATA (Optional - for testing)
-- =============================================
-- Uncomment the following to insert sample data
-- INSERT INTO leads (name, email, phone, source, status, notes) VALUES
-- ('Rahul Sharma', 'rahul@example.com', '+91 9876543210', 'Facebook', 'New', 'Interested in AI course'),
-- ('Priya Patel', 'priya@example.com', '+91 9876543211', 'Instagram', 'Contacted', 'Called once, will call back'),
-- ('Amit Kumar', 'amit@example.com', '+91 9876543212', 'Referral', 'Interested', 'Referred by Rahul'),
-- ('Neha Singh', 'neha@example.com', '+91 9876543213', 'Walk-in', 'Qualified', 'Ready to enroll');
-- INSERT INTO followups (lead_id, followup_date, followup_time, priority, reminder_days, description)
-- SELECT id, CURRENT_DATE + 1, '10:00', 'High', 1, 'Call to discuss course details'
-- FROM leads WHERE name = 'Rahul Sharma';
-- INSERT INTO followups (lead_id, followup_date, followup_time, priority, reminder_days, description)
-- SELECT id, CURRENT_DATE + 2, '14:30', 'Medium', 1, 'Follow up on initial call'
-- FROM leads WHERE name = 'Priya Patel';