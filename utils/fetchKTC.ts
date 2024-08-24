// src/services/ktcService.ts (adjust the path according to your project structure)

import { chromium } from 'playwright';
import { db } from '../drizzle/db'; // Adjust path as needed
import { ktcRankings } from '../drizzle/schema'; // Adjust path as needed
import { sql } from 'drizzle-orm';

// Define the type for the ranking object
export interface ktcEntry {
  player: string;
  value: string;
}

// Function to update the KTC rankings in the database
/*async function updateKtcRankings(rankings: Ranking[]) {
  // Truncate the table and reset the overall_ranking
  await db.execute(sql`TRUNCATE TABLE ktc_rankings RESTART IDENTITY`);

  // Insert updated rankings
  for (const ranking of rankings) {
    await db.insert(ktcRankings).values({
      player: ranking.player,
      value: parseInt(ranking.value, 10),
    });
  }
}*/

// Web scraper function to fetch rankings
export async function fetchKtcRankings(): Promise<ktcEntry[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  console.log('Browser launched');

  try {
    await page.goto('https://keeptradecut.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded');

    await page.waitForSelector('a.blue-cta.btn.btn-blue[href="/dynasty-rankings"]', { timeout: 10000 });
    console.log('Rankings button visible');
    await page.click('a.blue-cta.btn.btn-blue[href="/dynasty-rankings"]');
    console.log('Rankings button clicked');

    let rankings: ktcEntry[] = [];

    for (let i = 0; i < 10; i++) {
      console.log(`Processing page ${i + 1}`);

      await page.waitForSelector('.single-ranking', { timeout: 10000 });
      console.log('Rankings loaded');

      const pageRankings: ktcEntry[] = await page.$$eval('.single-ranking', elements =>
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
      console.log('Navigated to next page of rankings');
    }

    console.log('Scraping completed');

    return rankings;
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Error fetching rankings');
  } finally {
    console.log('Closing browser');
    await browser.close();
  }
}

// Export the update function as well
//export { updateKtcRankings };