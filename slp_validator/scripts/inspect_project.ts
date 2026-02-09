import puppeteer from 'puppeteer';

async function inspectPage() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    // Choose a known project with categories
    const url = 'https://colosseum.com/agent-hackathon/projects/axiom-protocol'; 
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract all spans and their classes to identify the category tags
    const tags = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('span'));
        return elements.map(el => ({
            text: el.innerText.trim(),
            className: el.className,
            parentClass: el.parentElement?.className
        })).filter(item => item.text.length > 0 && item.text.length < 20); // Filter for likely tag length
    });

    console.log("Potential Tags found:", JSON.stringify(tags, null, 2));
    
    await browser.close();
}

inspectPage();
