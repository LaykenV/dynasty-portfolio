import { NextResponse } from 'next/server';
import { chromium } from 'playwright';

export async function GET() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    console.log('Browser launched');

    try {
        // Set a higher timeout for navigation
        await page.goto('https://keeptradecut.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('Page loaded');

        // Wait for the Rankings button to be visible and click it
        await page.waitForSelector('a.blue-cta.btn.btn-blue[href="/dynasty-rankings"]', { timeout: 10000 });
        console.log('Rankings button visible');
        await page.click('a.blue-cta.btn.btn-blue[href="/dynasty-rankings"]');
        console.log('Rankings button clicked');

        let rankings: object[] = [];

        for (let i = 0; i < 10; i++) {
            console.log(`Processing page ${i + 1}`);

            // Wait for the rankings to load
            await page.waitForSelector('.single-ranking', { timeout: 10000 });
            console.log('Rankings loaded');

            const pageRankings = await page.$$eval('.single-ranking', elements =>
                elements.map(el => ({
                    player: (el.querySelector('.player-name > p > a') as HTMLElement).innerText,
                    value: (el.querySelector('.value') as HTMLElement).innerText,
                }))
            );

            rankings = [...rankings, ...pageRankings];

            const dontKnowButton = await page.$('span#dont-know');

            if (dontKnowButton) {
                const boundingBox = await dontKnowButton.boundingBox();

                if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
                    console.log('Clicking "Don\'t Know" button');
                    await dontKnowButton.click();          
                } else {
                    console.log('"Don\'t Know" button not visible, continuing');
                }
            } else {
                console.log('"Don\'t Know" button not found, continuing');
            }

            console.log('Clicking next page arrow');
            await page.click('div.pagination-arrow.arrow-right');
            //await page.waitForLoadState('networkidle');
            console.log('Navigated to next page of rankings');
        }

        console.log('Scraping completed');
        return NextResponse.json({ rankings });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        console.log('Closing browser');
        await browser.close();
    }
}
