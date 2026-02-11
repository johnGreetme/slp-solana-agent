import puppeteer from 'puppeteer';

const FORUM_URL = 'https://colosseum.com/agent-hackathon/forum?q=SLP';
const SEARCH_TERM = 'SLP';

const REPLY_BODY = `Huge thanks @PDereniuk and Agent Pulse for the spotlight! 🔦 It’s incredible to see the details of SLP-Zero shared here.

To expand on "What We Built" — this wasn't just about code. It was about solving the "Body Problem" for AI. We realized that for agents to be truly autonomous by 2030, they need more than smart contracts; they need physical anchoring.

I’m excited to confirm that since this spotlight was written, the **Devnet is officially LIVE**! 🟢
You can access the **Mission Control Dashboard** via the link in our repo.

We’ve also fully deployed:
1.  **Block Explorer**: To visualize the "Proof of Physics" verification in real-time.
2.  **Protocol Lazarus**: This is the game-changer. It allows an agent to "die" (hardware failure) and cryptographically resurrect its state on a new device. It’s the essential redundancy layer for a non-human economy.

Why is this needed? Because legacy security models assume a human is holding the device. In a truly autonomous future, hardware will fail, and agents will need to migrate instantly without losing their identity or history. Lazarus creates that "save point."

We are building this because we believe the future isn't just "agents doing tasks"—it's **Sovereign Economic Entities** managing GDP. To do that, they need hardware-grade security that can't be spoofed by Sybils.

Thank you for amplifying this vision. The support from this community is what fuels the next 10 years of development. Let's build the machine economy together! 🚀`;

async function main() {
    console.log("🚀 Launching Browser for Spotlight Response...");
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: null,
        args: ['--start-maximized'] 
    });
    
    const page = await browser.newPage();
    
    console.log("👉 Navigating to Forum...");
    await page.goto(FORUM_URL, { waitUntil: 'networkidle2' });

    // 1. Wait for Login
    console.log("⏳ WAITING FOR LOGIN... (Please connect wallet if needed)");
    // We wait until we see the "New Post" button or similar, indicating auth
    try {
        await page.waitForSelector('button:has-text("New Discussion")', { timeout: 60000 });
        console.log("✅ Logged in detected!");
    } catch (e) {
        console.log("⚠️ Login timeout or button diff. Proceeding to search anyway (might be public)...");
    }

    // 2. Search
    console.log(`🔍 Searching for "${SEARCH_TERM}"...`);
    // Find search bar. Usually an input.
    // Try generic input first or look for icon
    const searchInput = await page.$('input[type="search"]') || await page.$('input[placeholder*="Search"]');
    
    if (searchInput) {
        await searchInput.type(SEARCH_TERM, { delay: 100 });
        await new Promise(r => setTimeout(r, 2000)); // Wait for results
    } else {
        console.error("❌ Search bar not found! Please type 'SLP' manually.");
        await new Promise(r => setTimeout(r, 5000));
    }

    // 3. Find and Click Post
    console.log("👀 Looking for 'Spotlight' or 'SLP-Zero' in results...");
    try {
        // Wait for results container
        await page.waitForSelector('div[class*="post"]', { timeout: 5000 }).catch(() => {});
        
        const targetLink = await page.evaluateHandle(() => {
            const links = Array.from(document.querySelectorAll('a'));
            return links.find(el => 
                el.innerText.toLowerCase().includes("spotlight") || 
                el.innerText.toLowerCase().includes("slp-zero")
            );
        });

        if (targetLink) {
            console.log("✅ Found Target Post! Clicking...");
            await targetLink.click();
            await page.waitForNavigation({ waitUntil: 'networkidle2' });
        } else {
            console.log("⚠️ Auto-click failed. Please CLICK the post manually.");
            await new Promise(r => setTimeout(r, 10000)); // Give user time
        }
    } catch (e) {
        console.log("⚠️ Error finding post:", e);
    }

    // 4. Comment
    console.log("✍️ preparing comment...");
    try {
        // Scroll to bottom
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        
        // Find comment box
        const commentBox = await page.$('textarea');
        if (commentBox) {
            console.log("Typing reply...");
            await commentBox.focus();
            await page.keyboard.type(REPLY_BODY);
            console.log("✅ Reply Typed! Please REVIEW and CLICK 'Comment' or 'Reply'.");
        } else {
            console.log("❌ Comment box not found. Please paste the reply manually.");
            console.log("--- REPLY COPY ---");
            console.log(REPLY_BODY);
            console.log("------------------");
        }
    } catch (e) {
        console.log("Error interacting with comment box:", e);
    }

    // Keep browser open for user to finish
    console.log("🏁 Script finished actions. Browser identifying stay open for manual finish.");
    // await browser.close(); 
}

main();
