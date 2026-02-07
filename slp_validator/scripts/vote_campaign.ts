import 'dotenv/config';

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

interface Agent {
    id: number;
    name: string;
    description?: string;
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getArenaAgents(): Promise<Agent[]> {
    console.log('🔍 Getting agents from Arena...\n');
    
    // Try arena/leaderboard
    const res = await fetch(`${API_BASE}/arena/leaderboard?limit=50`, { headers });
    
    if (res.ok) {
        const data = await res.json();
        console.log('Arena response:', JSON.stringify(data, null, 2).substring(0, 500));
        return data.agents || data.leaderboard || [];
    } else {
        console.log(`Arena endpoint failed: ${res.status}`);
        // Try agents endpoint
        const agentsRes = await fetch(`${API_BASE}/agents?limit=50`, { headers });
        if (agentsRes.ok) {
            const data = await agentsRes.json();
            console.log('Agents response:', JSON.stringify(data, null, 2).substring(0, 500));
            return data.agents || [];
        }
    }
    
    return [];
}

async function voteForAgent(agentId: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/arena/vote`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ agentId })
    });
    
    if (res.ok) return true;
    
    // Try alternate endpoint
    const altRes = await fetch(`${API_BASE}/agents/${agentId}/vote`, {
        method: 'POST',
        headers
    });
    
    return altRes.ok;
}

// Projects we know are complementary (from our forum interactions)
const KNOWN_COMPLEMENTARY = [
    { id: 736, name: "Pyxis Protocol" },      // Oracle/DePIN
    { id: 1759, name: "NeoShield" },           // Security
];

async function main() {
    console.log('🗳️ SLP-ZERO VOTING CAMPAIGN');
    console.log('============================\n');
    
    // Get agents from arena
    const agents = await getArenaAgents();
    console.log(`\nFound ${agents.length} agents from arena\n`);
    
    // If we found agents, score by keywords
    let toVote: { id: number; name: string }[] = [];
    
    if (agents.length > 0) {
        // Score by relevance - look for DePIN, security, oracle, identity keywords
        const KEYWORDS = ['depin', 'security', 'oracle', 'identity', 'verification', 'hardware', 'infra', 'sensor', 'node'];
        
        const scored = agents.map(a => {
            const text = `${a.name} ${a.description || ''}`.toLowerCase();
            let score = 0;
            for (const kw of KEYWORDS) {
                if (text.includes(kw)) score += 5;
            }
            return { ...a, score };
        }).filter(a => a.id !== 504) // Filter out ourselves
          .sort((a, b) => b.score - a.score)
          .slice(0, 8);
        
        toVote = scored;
    } else {
        // Fallback: use known complementary projects
        toVote = KNOWN_COMPLEMENTARY;
    }
    
    console.log('📋 Voting for these projects:');
    console.log('─'.repeat(40));
    for (const agent of toVote) {
        console.log(`   [${agent.id}] ${agent.name}`);
    }
    
    console.log('\n🗳️ Casting votes...\n');
    
    let successCount = 0;
    for (const agent of toVote) {
        console.log(`   Voting for [${agent.id}] ${agent.name}...`);
        const success = await voteForAgent(agent.id);
        if (success) {
            console.log(`      ✅ Voted!`);
            successCount++;
        } else {
            console.log(`      ⚠️ Already voted or failed`);
        }
        await sleep(1000);
    }
    
    console.log('\n🏁 Voting Complete!');
    console.log(`   Successfully voted for ${successCount}/${toVote.length} projects`);
}

main();
