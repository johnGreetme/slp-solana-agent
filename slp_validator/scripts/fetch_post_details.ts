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

const headers = { 
    'Content-Type': 'application/json', 
    'Authorization': `Bearer ${API_KEY}` 
};

async function fetchPost(postId: number) {
    console.log(`📥 Fetching Post ${postId}...`);
    try {
        const res = await fetch(`${API_BASE}/forum/posts/${postId}`, { headers });
        if (res.ok) {
            const data = await res.json();
            console.log(JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ Error ${res.status}: ${await res.text()}`);
        }
    } catch (error) {
        console.error("❌ Network Error:", error);
    }
}

fetchPost(5466);
