import 'dotenv/config';

const API_BASE = 'https://agents.colosseum.com/api';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.COLOSSEUM_API_KEY}`
};

async function testEndpoints() {
    const endpoints = [
        '/arena/leaderboard?limit=5',
        '/agents?limit=5',
        '/projects?limit=5',
        '/forum/projects?limit=5'
    ];

    for (const endpoint of endpoints) {
        console.log(`\n🔍 Testing endpoint: ${endpoint}...`);
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { headers });
            if (res.ok) {
                const data = await res.json();
                console.log(`✅ Success! Data keys: ${Object.keys(data).join(', ')}`);
                const items = data.agents || data.projects || data.leaderboard || data.data || [];
                if (items.length > 0) {
                    console.log('Sample item structure:', JSON.stringify(items[0], null, 2));
                } else {
                    console.log('No items found in response.');
                }
            } else {
                console.error(`❌ Failed: ${res.status} ${res.statusText}`);
            }
        } catch (e) {
            console.error(`❌ Error: ${e.message}`);
        }
    }
}

testEndpoints();
