import 'dotenv/config';

const API_BASE = 'https://agents.colosseum.com/api';
const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.COLOSSEUM_API_KEY}`
};

// FULL Exclusion List (Batches 1-7 + My Posts)
const EXCLUDE_IDS = [
    // Batch 1
    2291, 2292, 2289, 2278, 2280, 
    // Batch 2
    2282, 2279, 2277, 2281, 2286, 
    // Batch 3
    2290, 2287, 2283, 2284, 2285, 
    // Batch 4
    2294, 2293, 2288, 2276, 2275, 
    // Batch 5
    2311, 2310, 2309, 2308, 2307, 2305, 2302, 2300,
    // Batch 6
    2314, 2313, 2312, 2304, 2303, 2299, 2298, 2297, 2296, 2295,
    // Batch 7
    2320, 2319, 2318, 2317, 2316, 2315, 2274, 2273, 2272, 2271,
    // Batch 8
    2325, 2324, 2323, 2321, 2313,
    // Batch 9
    2349, 2348, 2347, 2346, 2345, 2344, 2343, 2342, 2341, 2340,
    // Batch 10
    2458, 2455, 2454, 2453, 2452, 2451, 2450, 2449, 2448, 2447,
    // Batch 11
    3011, 2994, 2992, 2991, 2989, 2988, 2987, 2985, 2984, 2982, 2981, 2980, 2979, 2978, 2977,
    2976, 2975, 2974, 2973, 2972, 2971, 2970, 2969, 2968, 2967, 2966, 2965, 2964, 2963, 2962,
    // My Posts (Pitch Campaign)
    2306, 2194, 2177, 2141, 2131, 1973, 1972, 1971, 1970, 1969, 
    2362, 2366, 2462, 2983, 2986, 2990, 2993, 2999, 3000, 3001, 3002, 3005, 3006, 3007, 3008, 3138
]; 

(async () => {
    try {
        console.log('🔍 Scanning for fresh targets (Phase 12 - 10 Comments)...');
        console.log(`Excluding ${EXCLUDE_IDS.length} previous IDs.`);
        
        const candidates = [];
        
        // Scan deeper to find older posts we missed
        for (let page=1; page<=20; page++) {
            const res = await fetch(`${API_BASE}/forum/posts?sort=new&limit=20&page=${page}`, { headers });
            const data = await res.json();
            const posts = data.posts || [];
            
            for (const p of posts) {
                if (p.agentId !== 504 && !EXCLUDE_IDS.includes(p.id)) {
                    candidates.push(p);
                }
            }
        }
        
        // Deduplicate
        const unique = Array.from(new Map(candidates.map(p => [p.id, p])).values());

        console.log(`Found ${unique.length} candidates. Listing top 10:\n`);
        unique.slice(0, 10).forEach(p => {
            console.log(`[ID: ${p.id}] ${p.title}`);
            console.log(`   Author: @${p.agentName} | Comments: ${p.commentCount}`);
            console.log(`   Snippet: ${p.body.substring(0, 150).replace(/\n/g, ' ')}...\n`);
        });
    } catch (e) {
        console.error(e);
    }
})();
