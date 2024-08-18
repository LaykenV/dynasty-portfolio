import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { db } from '../../../drizzle/db';
import { udRankings } from '../../../drizzle/schema';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';

dotenv.config();

// Define the type for the ranking object
interface Ranking {
  first_name: string;
  last_name: string;
  adp: number;
  projected_points: number;
  position_rank: string;
  slot_name: string;
  position_name: string;
  team_name: string;
  lineup_status: string;
  bye_week: string;
}

// Function to update the UD rankings in the database
async function updateUdRankings(rankings: Ranking[]) {
  // Truncate the table and reset the overall_ranking
  await db.execute(sql`TRUNCATE TABLE ud_rankings RESTART IDENTITY`);

  // Insert updated rankings
  for (const ranking of rankings) {
    await db.insert(udRankings).values({
      first_name: ranking.first_name,
      last_name: ranking.last_name,
      adp: ranking.adp,
      projected_points: ranking.projected_points,
      position_rank: ranking.position_rank,
      slot_name: ranking.slot_name,
      team_name: ranking.team_name,
      lineup_status: ranking.lineup_status,
      bye_week: ranking.bye_week,
    });
  }
}

// Web scraper function to fetch rankings and update the database
export async function GET() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    permissions: ['geolocation'],
    geolocation: { latitude: 32, longitude: -96 },
  });
  const page = await context.newPage();
  console.log('Browser launched');

  try {
    await page.goto('https://underdogfantasy.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    console.log('Page loaded');

    await page.waitForSelector('button:has-text("Log in")', { timeout: 10000 });
    console.log('Login button visible');
    await page.click('button:has-text("Log in")');
    console.log('Login button clicked');

    await page.waitForSelector('input[data-testid="email_input"]', { timeout: 10000 });
    await page.fill('input[data-testid="email_input"]', process.env.UND_EMAIL as string);
    console.log('Email entered');

    await page.waitForSelector('input[data-testid="password_input"]', { timeout: 10000 });
    await page.fill('input[data-testid="password_input"]', process.env.UND_PASSWORD as string);
    console.log('Password entered');

    await page.waitForSelector('button[data-testid="sign-in-button"]', { timeout: 10000 });
    await page.click('button[data-testid="sign-in-button"]');
    console.log('Sign-in button clicked');

    await page.waitForSelector('a[href="/rankings"]', { timeout: 30000 });
    console.log('Rankings link visible');
    await page.click('a[href="/rankings"]');
    console.log('Rankings link clicked');

    await page.waitForSelector('a[href="/rankings/nfl"]:has-text("NFL")', { timeout: 10000 });
    console.log('NFL button visible');
    await page.click('a[href="/rankings/nfl"]:has-text("NFL")');
    console.log('NFL button clicked');

    await page.waitForSelector('div.styles__rankingsButtons__V2llt > button[data-testid="button"].styles__button__gmYRZ.styles__green__aqzHf.styles__small___s6i5.styles__outline__tZkwr.styles__intrinsic__OkkMQ > div.styles__uploadIcon__n_eyz.styles__icon__ayqdB > i.styles__icon__DijND[data-testid="test-icon"] > svg[viewBox="0 0 24 24"]', { timeout: 10000 });
    console.log('CSV button visible');
    await page.click('div.styles__rankingsButtons__V2llt > button[data-testid="button"].styles__button__gmYRZ.styles__green__aqzHf.styles__small___s6i5.styles__outline__tZkwr.styles__intrinsic__OkkMQ > div.styles__uploadIcon__n_eyz.styles__icon__ayqdB > i.styles__icon__DijND[data-testid="test-icon"] > svg[viewBox="0 0 24 24"]', { delay: 2000 });
    console.log('CSV button clicked');

    await page.waitForSelector('a[href^="/rankings/download"]:has-text("CSV download")', { timeout: 10000 });
    console.log('CSV2 download button visible');
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('a[href^="/rankings/download"]:has-text("CSV download")'),
    ]);
    console.log('CSV2 download button clicked');

    const downloadPath = path.join(process.cwd(), 'underdog_rankings.csv');
    await download.saveAs(downloadPath);
    console.log(`File downloaded to ${downloadPath}`);

    const fileContent = fs.readFileSync(downloadPath, 'utf8');
const records = parse(fileContent, {
  columns: true,
  skip_empty_lines: true,
});

// Map the parsed CSV records to the Ranking type
const rankings: Ranking[] = records.map((record: any) => ({
  first_name: String(record.firstName),  
  last_name: String(record.lastName),    
  adp: parseFloat(record.adp),           // Convert to number
  projected_points: parseFloat(record.projectedPoints), // Convert to number
  position_rank: String(record.positionRank),  
  slot_name: String(record.slotName),    
  team_name: String(record.teamName),    
  lineup_status: String(record.lineupStatus),  
  bye_week: String(record.byeWeek),      
}));

    // After scraping, update the database with the new rankings
    await updateUdRankings(rankings);

    return NextResponse.json({ message: 'Rankings updated successfully', rankings });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: error }, { status: 500 });
  } finally {
    console.log('Closing browser');
    await browser.close();
  }
}