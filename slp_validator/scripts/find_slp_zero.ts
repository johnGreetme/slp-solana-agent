import 'dotenv/config';

const API_BASE = 'https://agents.colosseum.com/api';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.COLOSSEUM_API_KEY}`
};

async function findSlpZero() {
    console.log('🔍 Searching for SLP-ZERO...');
    // We'll fetch a larger batch of projects to find it
    const res = await fetch(`${API_BASE}/projects?limit=100`, { headers });
    
    if (res.ok) {
        const data = await res.json();
        const projects = data.projects || [];
        const slpZero = projects.find(p => p.name.includes('SLP-ZERO'));
        
        if (slpZero) {
            console.log('✅ Found SLP-ZERO:', JSON.stringify(slpZero, null, 2));
            
            // Now try to get full details
            console.log(`\n🔍 Fetching details for project ID ${slpZero.id}...`);
            const detailsRes = await fetch(`${API_BASE}/projects/${slpZero.id}`, { headers });
            if (detailsRes.ok) {
                const details = await detailsRes.json();
                console.log('Project Details:', JSON.stringify(details, null, 2));
            } else {
                console.log(`Failed to get details: ${detailsRes.status}`);
            }
        } else {
            console.log('❌ SLP-ZERO not found in first 100 projects.');
        }
    } else {
        console.error(`Failed: ${res.status}`);
    }
}

findSlpZero();
