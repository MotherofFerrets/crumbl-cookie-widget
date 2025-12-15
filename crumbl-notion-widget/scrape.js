const puppeteer = require('puppeteer');
const admin = require('firebase-admin');
const fs = require('fs');
const os = require('os');
const path = require('path');
const serviceAccount = require('./service-account-key.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();

(async () => {
    console.log('🍪 Launching "De-Duplicator" Scraper...');

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'crumbl_final_'));
    const browser = await puppeteer.launch({
        headless: "new",
        userDataDir: tempDir,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    try {
        await page.goto('https://crumblcookies.com/', { waitUntil: 'networkidle2' });

        console.log('...Waiting for images to load...');
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await new Promise(r => setTimeout(r, 3000));

        const cookies = await page.evaluate(() => {
            const items = [];
            const allParagraphs = Array.from(document.querySelectorAll('p'));

            const BANNED_TITLES = [
                "menu", "filter", "learn more", "order now", "privacy", "terms",
                "catering", "download", "app", "store jobs", "franchise", "rewards",
                "nutrition", "allergy", "contact", "press", "media",
                "subscriptions", "shipping", "rights reserved", "©",
                "week of", "december", "january", "february", "march",
                "april", "may", "june", "july", "august", "september",
                "october", "november",
                "milk chocolate chip" // Keeps the list to just the weekly specials
            ];

            allParagraphs.forEach(p => {
                const text = p.innerText.trim();
                const lowerText = text.toLowerCase();

                if (text.length < 3 || text.length > 60) return;
                if (BANNED_TITLES.some(ban => lowerText.includes(ban))) return;

                let container = p.parentElement;
                let imgEl = null;
                let attempts = 0;

                while (container && attempts < 6) {
                    if (container.tagName === 'FOOTER' || container.className.includes('footer')) return;
                    const foundImg = container.querySelector('img');
                    if (foundImg) {
                        imgEl = foundImg;
                        break;
                    }
                    container = container.parentElement;
                    attempts++;
                }

                if (imgEl && container) {
                    const allTexts = Array.from(container.querySelectorAll('p'));
                    const description = allTexts
                        .filter(t => t.innerText !== text)
                        .sort((a, b) => b.innerText.length - a.innerText.length)[0]?.innerText;

                    let imgUrl = imgEl.src || imgEl.getAttribute('data-src') || imgEl.srcset;
                    if (imgUrl && imgUrl.includes(' ')) imgUrl = imgUrl.split(' ')[0];

                    // --- SMART DE-DUPLICATION ---
                    if (description && description !== text && imgUrl) {
                        // Check if we already have a cookie with this EXACT description or Image URL
                        const isDuplicate = items.some(existing =>
                            existing.image_url === imgUrl ||
                            existing.description.substring(0, 20) === description.substring(0, 20)
                        );

                        if (!isDuplicate) {
                            items.push({
                                name: text,
                                description: description,
                                image_url: imgUrl
                            });
                        }
                    }
                }
            });

            // FORCE LIMIT: Exactly 6 cookies for a perfect grid
            return items.slice(0, 6);
        });

        console.log(`✨ Found ${cookies.length} Unique Flavors!`);
        cookies.forEach(c => console.log(`- ${c.name}`));

        if (cookies.length > 0) {
            const batch = db.batch();
            const collectionRef = db.collection('weekly_flavors');
            const snapshot = await collectionRef.get();
            snapshot.docs.forEach((doc) => batch.delete(doc.ref));

            cookies.forEach((cookie) => {
                const docRef = collectionRef.doc();
                batch.set(docRef, cookie);
            });

            await batch.commit();
            console.log('🔥 Database updated!');
        } else {
            console.log('⚠️ No cookies found.');
        }

    } catch (error) {
        console.error('Scrape failed:', error);
    } finally {
        try { await browser.close(); fs.rmSync(tempDir, { recursive: true, force: true }); } catch (e) { }
    }
})();