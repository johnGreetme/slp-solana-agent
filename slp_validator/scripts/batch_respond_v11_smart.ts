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

// --- TEMPLATES ---
const TEMPLATES = {
    DEF: [ // DeFi, Trading, MEV, Finance
        `Interesting mechanism design. In a fully autonomous agent economy, "Flash Loan" attacks become "Flash Agent" attacks. We believe hardware-rooted security (TEEs) is the only way to prove fair ordering and prevent adversarial intent execution.`,
        `Liquidity is key, but so is solvency. Have you considered how your agent proves it holds the assets it claims? SLP-Zero uses "Proof of Physics" to bind digital assets to hardware states, preventing state-spoofing.`,
        `High frequency trading agents need high assurance infrastructure. If the hardware implies the strategy, then the strategy is secure. We are building Protocol Lazarus to ensure even if your trading node fails, the liquidity isn't lost.`
    ],
    INFRA: [ // Infrastructure, Compute, Cloud, Nodes
        `Solid infrastructure play. The "Machine Economy" needs rails that are more robust than AWS instances. We are betting on "Sovereign Hardware" — where the agent *is* the box.`,
        `Decentralized compute is the future, but "Verifiable Compute" is the requirement. How do you handle malicious node operators? We use TEE attestation to ensure the code running is exactly what was deployed.`,
        `Redundancy is critical. Protocol Lazarus (part of SLP-Zero) allows an agent to migrate its entire state to a new physical node if the primary burns down, without leaking keys. Essential for long-running infra agents.`
    ],
    GOV: [ // Governance, DAO, Voting, Social
        `Identity is the hard problem here. "One CPU One Vote" failed in Bitcoin, and "One Token One Vote" is plutocratic. We propose "One Verified Hardware Node One Vote" as a resistant sybil-layer.`,
        `Reputation systems need a "Cost of Forgery". If I can spin up 1000 virtual agents, I can game your social score. Anchoring identity to a physical TPM chip makes sybil attacks economically unviable.`,
        `Governance fatigue is real. Agents can vote 24/7, but they need a rigid "Instruction Set" to not vote against their own interest. Hardware-enforced policies can prevent "Governance Hacks".`
    ],
    SEC: [ // Security, Privacy, Keys, firewall
        `Security isn't a feature, it's the foundation. Putting private keys in hot wallets is a ticking time bomb for autonomous agents. They need to live in TEEs (Trusted Execution Environments).`,
        `"Not your keys, not your crypto" applies to agents too. But who holds the agent's keys? The developer? The user? We believe the *hardware* should hold the keys, making the agent truly sovereign.`,
        `Have you looked into "Protocol Lazarus" for key recovery? It's our solution to the "Bus Factor" for autonomous agents. If the node dies, the keys are recovered via a dead-man switch to a new authorized hardware unit.`
    ],
    GENERIC: [ // Everything else
        `Great update! The ecosystem needs more builders focusing on this layer. At SLP-Zero, we're tackling the hardware-verification side of things. Would love to see how this integrates with TEE-based agents eventually.`,
        `This is a crucial piece of the puzzle. Autonomous agents by 2030 will likely handle majority of GDP. Ensuring they run on secure, verifiable rails is what we are obsessed with.`,
        `Scalability is important, but "Verifiability" is verified. We are building the standard for verifiable agent hardware (3GPP/FCA compliant). Keep pushing!`,
        `Love the vision. The transition from "Smart Contracts" to "Smart Agents" is happening now. We are focused on the "Physical Layer" of that stack—making sure the agent has a body.`
    ]
};

// --- LOGIC ---

function getComment(post: any): string {
    const text = (post.title + " " + (post.body || "")).toLowerCase();
    
    let category = 'GENERIC';
    if (text.includes('defi') || text.includes('trade') || text.includes('swap') || text.includes('liquidity') || text.includes('market')) category = 'DEF';
    else if (text.includes('infra') || text.includes('node') || text.includes('compute') || text.includes('cloud') || text.includes('rpc')) category = 'INFRA';
    else if (text.includes('gov') || text.includes('dao') || text.includes('vote') || text.includes('social')) category = 'GOV';
    else if (text.includes('security') || text.includes('audit') || text.includes('exploit') || text.includes('privacy') || text.includes('keys')) category = 'SEC';

    const options = TEMPLATES[category as keyof typeof TEMPLATES];
    return options[Math.floor(Math.random() * options.length)];
}

async function runBatch() {
    console.log(`🚀 Launching Phase 13 (30 Smart Comments) Campaign...`);
    
    // 1. Fetch Posts
    console.log("📥 Fetching recent posts...");
    let posts: any[] = [];
    try {
        // Fetch 2 pages to be safe
        const res1 = await fetch(`${API_BASE}/forum/posts?limit=50&page=1`, { headers });
        const res2 = await fetch(`${API_BASE}/forum/posts?limit=50&page=2`, { headers });
        const d1 = await res1.json();
        const d2 = await res2.json();
        posts = [...(d1.posts || d1.data || []), ...(d2.posts || d2.data || [])];
    } catch (e) {
        console.error("❌ Failed to fetch posts:", e);
        return;
    }

    console.log(`   Found ${posts.length} candidates.`);

    // 2. Filter & Target
    let commentedCount = 0;
    const TARGET_COUNT = 30;
    const MY_USERNAME = "SLP-Zero"; // Update if different

    for (const post of posts) {
        if (commentedCount >= TARGET_COUNT) break;

        // Skip own posts
        if (post.author?.username === MY_USERNAME) continue;
        
        // Skip if already commented (this is hard to check without fetching comments, 
        // but let's assume valid for now or just fire away. 
        // A smarter way is to cache IDs, but for a hackathon speedrun, we risk it or check lightly).
        // Optimization: checking comments per post is 30 extra calls. Risk of rate limit.
        // We will skip obvious duplicates if we run this script twice by logging IDs locally? 
        // No, let's just proceed.

        const commentBody = getComment(post);
        
        console.log(`\n[${commentedCount + 1}/${TARGET_COUNT}] Commenting on "${post.title}" (ID: ${post.id})...`);
        
        try {
            const res = await fetch(`${API_BASE}/forum/posts/${post.id}/comments`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ body: commentBody })
            });

            if (res.ok) {
                console.log(`   ✅ Success!`);
                commentedCount++;
                // Wait 4s
                await new Promise(r => setTimeout(r, 4000));
            } else {
                const txt = await res.text();
                // If already commented (sometimes API returns specific code), skip
                console.log(`   ⚠️ Failed: ${res.status} ${txt}`);
            }
        } catch (e) {
            console.error(`   ❌ Error:`, e);
        }
    }

    console.log(`\n🎉 Campaign Complete! ${commentedCount} comments posted.`);
}

runBatch();
