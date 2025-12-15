const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('🕵️  Starting Diagnostic Run...');

    const browser = await puppeteer.launch({
        headless: "new",
        // Add arguments to mimic a real window
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
    });
    const page = await browser.newPage();

    // 1. Masquerade as a real User
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        await page.goto('https://crumblcookies.com/', { waitUntil: 'networkidle0', timeout: 60000 });

        // 2. Take a Screenshot (Mental sanity check)
        await page.screenshot({ path: 'debug_screenshot.png' });
        console.log('📸 Screenshot saved to debug_screenshot.png');

        // 3. Save the Raw HTML
        const html = await page.content();
        fs.writeFileSync('debug.html', html);
        console.log('📝 Raw HTML saved to debug.html');

        // 4. Hunt for the "Gold Mine" (Next.js Data)
        const nextData = await page.evaluate(() => {
            const script = document.getElementById('__NEXT_DATA__');
            if (script) {
                return JSON.parse(script.innerText);
            }
            return null;
        });

        if (nextData) {
            console.log('🎉 GOLD MINE FOUND: Detected __NEXT_DATA__!');
            fs.writeFileSync('crumbl_data.json', JSON.stringify(nextData, null, 2));
            console.log('💾 Data saved to crumbl_data.json');

            // Quick peek to see if flavors are inside
            const jsonStr = JSON.stringify(nextData);
            if (jsonStr.includes('Milk Chocolate Chip') || jsonStr.includes('cookie')) {
                console.log('✅ Confirmed: Cookie data is inside the JSON!');
            }
        } else {
            console.log('❌ No __NEXT_DATA__ found. We might need to use standard scraping.');
        }

    } catch (e) {
        console.error('Diagnostic failed:', e);
    } finally {
        await browser.close();
    }
})();