import { chromium } from 'playwright';

// Define the type for the ranking object
export interface ktcEntry {
  player: string;
  value: string;
  positionRank: string;
}

export interface ktcTrending {
  name: string;
}

export interface KTCRankings {
  rankings: ktcEntry[];
  trending: ktcTrending[];
}


export async function fetchKtcRankings(): Promise<KTCRankings> {
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
        elements.map(el => {
          const player = (el.querySelector('.player-name > p > a') as HTMLElement).innerText;
          const value = (el.querySelector('.value') as HTMLElement).innerText;
          let positionRank = (el.querySelector('.position-team > p') as HTMLElement).innerText;
          
          if (positionRank !== "PICK") {
            positionRank = positionRank.replace(/\D/g, '');
          }

          return { player, value, positionRank };
        })
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

    await page.waitForSelector('div.riser > a.insight-link', { timeout: 10000 });
    console.log('Trending loaded');

    const trending: ktcTrending[] = await page.$$eval('div.riser > a.insight-link', elements =>
      elements.map(el => ({
        name: (el.querySelector('.topFivePlayer > .topFiveName > p') as HTMLElement).innerText,
      }))
    );

    console.log('Scraping completed');
    console.log(trending);
    

    return { rankings, trending };
  } catch (error) {
    console.error('Scraping error:', error);
    throw new Error('Error fetching rankings');
  } finally {
    console.log('Closing browser');
    await browser.close();
  }
}