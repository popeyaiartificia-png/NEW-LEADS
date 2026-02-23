const fs = require('fs');
const path = require('path');
const https = require('https');

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

const options = {
    hostname: new URL(supabaseUrl).hostname,
    path: '/rest/v1/pipeline_stages?select=*',
    method: 'GET',
    headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json'
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${data}`);
    });
});

req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
});

req.end();
