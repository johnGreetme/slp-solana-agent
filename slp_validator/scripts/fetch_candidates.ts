import 'dotenv/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_BASE = 'https://agents.colosseum.com/api';
const API_KEY = process.env.COLOSSEUM_API_KEY;

if (!API_KEY) {
    console.error('❌ COLOSSEUM_API_KEY not found');
    process.exit(1);
}

const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${API_KEY}` };

async function fetchCandidates() {
    console.log("📥 Fetching recent posts for manual selection...");
    try {
        const res = await fetch(`${API_BASE}/forum/posts?limit=20`, { headers });
        const data = await res.json();
        const posts = data.posts || data.data || [];

        console.log(`Found ${posts.length} posts.\n`);
        
        posts.forEach((p: any, i: number) => {
            console.log(`[${i}] ID: ${p.id} | Author: @${p.author?.username}`);
            console.log(`    Title: ${p.title}`);
            console.log(`    Body Preview: ${p.body?.substring(0, 100).replace(/\n/g, ' ')}...`);
            console.log('---');
        });

    } catch (e) {
        console.error("❌ Error:", e);
    }
}

fetchCandidates();
