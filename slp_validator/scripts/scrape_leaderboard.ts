import puppeteer from 'puppeteer';
import fs from 'fs';

async function scrapeLeaderboard() {
    console.log("🚀 Starting Leaderboard Scrape...");
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // 1. Get Project URLs from Leaderboard
    console.log("Navigation to Leaderboard...");
    await page.goto('https://colosseum.com/agent-hackathon/leaderboard', { waitUntil: 'networkidle2' });
    
    console.log("Scrolling to load 500 projects...");
    let previousHeight = 0;
    while (true) {
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await new Promise(r => setTimeout(r, 2000));
        
        const count = await page.evaluate(() => document.querySelectorAll('a[href*="/projects/"]').length);
        console.log(`Loaded ${count} projects...`);
        
        if (count >= 500) break;
        
        // Break if scroll didn't add new content (end of list)
        const newHeight = await page.evaluate('document.body.scrollHeight');
        if (newHeight === previousHeight && count > 450) break; 
    }

    const projects = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href*="/projects/"]'));
        return links.slice(0, 500).map((link, index) => ({
            rank: index + 1,
            name: link.querySelector('h3')?.innerText || "Unknown",
            url: link.href
        }));
    });

    console.log(`✅ Extracted ${projects.length} project URLs.`);
    
    // 2. Visit each project to get category
    const results = [];
    
    // We'll process in chunks to be safe, but sequentially as requested involves "visiting each"
    // To speed it up slightly while remaining "human-like", we'll just iterate.
    
    for (let i = 0; i < projects.length; i++) {
        const p = projects[i];
        console.log(`[${i+1}/${projects.length}] Visiting ${p.name}...`);
        
        try {
            await page.goto(p.url, { waitUntil: 'networkidle2' });
            
            // Wait for categories to load (timeout fast if not found to avoid stalling)
            try {
                await page.waitForSelector('span[class*="bg-gray-dark-4/50"]', { timeout: 2000 });
            } catch (e) {
                // Ignore timeout, might be "Other"
            }
            
            // Extract first category
            const category = await page.evaluate(() => {
                const spans = Array.from(document.querySelectorAll('span'));
                // Look for the specific style class found in inspection
                const tag = spans.find(s => s.className.includes('bg-gray-dark-4/50'));
                return tag ? tag.innerText.trim() : "Other";
            });
            
            results.push({ ...p, category });
            console.log(`   -> ${category}`);
            
        } catch (e) {
            console.error(`   ❌ Error visiting ${p.name}: ${e.message}`);
            results.push({ ...p, category: "Error" });
        }
    }
    
    await browser.close();
    
    // 3. Save Data
    fs.writeFileSync('leaderboard_data.json', JSON.stringify(results, null, 2));
    console.log("💾 Saved data to leaderboard_data.json");
    
    // 4. Generate Summary Table
    const stats: Record<string, number> = {};
    results.forEach(r => {
        const cat = r.category;
        stats[cat] = (stats[cat] || 0) + 1;
    });
    
    const sortedStats = Object.entries(stats)
        .sort(([,a], [,b]) => b - a)
        .map(([cat, count]) => ({
            category: cat,
            count,
            percentage: ((count / results.length) * 100).toFixed(1) + '%'
        }));
        
    console.table(sortedStats);
}

scrapeLeaderboard();
