import puppeteer from 'puppeteer';
import * as fs from 'fs';

async function inspectPage() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Choose SLP-Zero to check for DePIN
    const url = 'https://colosseum.com/agent-hackathon/projects/slp-zero'; 
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    // Wait for content to load
    await page.waitForSelector('h1');
    // Wait a bit more for hydration
    await new Promise(r => setTimeout(r, 2000));

    // Save HTML to inspect
    const html = await page.content();
    fs.writeFileSync('slp_zero.html', html);
    console.log("Saved HTML to slp_zero.html");

    // Screenshot
    await page.screenshot({ path: 'slp_zero_debug.png', fullPage: true });
    console.log("Saved screenshot to slp_zero_debug.png");

    // Extract all potential tags (any short text in common block elements)
    const texts = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll('span, div, p, a, li'));
        return nodes
            .map(el => ({
                tag: el.tagName,
                text: el.innerText ? el.innerText.trim() : "",
                className: el.className
            }))
            .filter(item => item.text.length > 0 && item.text.length < 30);
    });

    console.log("All short texts:", JSON.stringify(texts, null, 2));
    
    await browser.close();
}

inspectPage();
