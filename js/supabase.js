// Supabase Configuration
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://trftbkjcljgdvwkscjba.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRyZnRia2pjbGpnZHZ3a3NjamJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTY3MTQsImV4cCI6MjA4MzI3MjcxNH0.7gRAgfg9SeUmstcjtaosoDZehlpnZ-DlqgRtoLVYEhg';

// Initialize Supabase client
let supabaseClient = null;

function initSupabase() {
    if (typeof supabase !== 'undefined') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('Supabase initialized successfully');
        return true;
    }
    console.error('Supabase library not loaded');
    return false;
}

// Get Supabase client instance
function getSupabase() {
    if (!supabaseClient) {
        initSupabase();
    }
    return supabaseClient;
}

// Check if Supabase is configured
function isSupabaseConfigured() {
    return SUPABASE_URL !== 'YOUR_SUPABASE_URL' && SUPABASE_ANON_KEY !== 'YOUR_SUPABASE_ANON_KEY';
}

// Export for use in other modules
window.SupabaseConfig = {
    init: initSupabase,
    getClient: getSupabase,
    isConfigured: isSupabaseConfigured
};
