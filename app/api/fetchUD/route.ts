import { NextResponse } from 'next/server';
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';

dotenv.config();

export async function GET() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        // Ask for permissions for geolocation
        permissions: ['geolocation'],
        geolocation: { latitude: 32, longitude: -96 } // This allows the website to request geolocation access
    });
    const page = await context.newPage();
    console.log('Browser launched', context);

    try {
        // Set a higher timeout for navigation
        await page.goto('https://underdogfantasy.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        console.log('Page loaded');

        // Wait for the Login button to be visible and click it
        await page.waitForSelector('button:has-text("Log in")', { timeout: 10000 });
        console.log('Login button visible');
        await page.click('button:has-text("Log in")');
        console.log('Login button clicked');

        // Input email
        await page.waitForSelector('input[data-testid="email_input"]', { timeout: 10000 });
        await page.fill('input[data-testid="email_input"]', process.env.UND_EMAIL as string);
        console.log('Email entered');

        // Input password
        await page.waitForSelector('input[data-testid="password_input"]', { timeout: 10000 });
        await page.fill('input[data-testid="password_input"]', process.env.UND_PASSWORD as string);
        console.log('Password entered');

        // Click the sign-in button
        await page.waitForSelector('button[data-testid="sign-in-button"]', { timeout: 10000 });
        await page.click('button[data-testid="sign-in-button"]');
        console.log('Sign-in button clicked');

        // Wait for the Rankings link to be visible and click it
        await page.waitForSelector('a[href="/rankings"]', { timeout: 30000 });
        console.log('Rankings link visible');
        await page.click('a[href="/rankings"]');
        console.log('Rankings link clicked');

        // Wait for the NFL rankings button to be visible and click it
        await page.waitForSelector('a[href="/rankings/nfl"]:has-text("NFL")', { timeout: 10000 });
        console.log('NFL button visible');
        await page.click('a[href="/rankings/nfl"]:has-text("NFL")');
        console.log('NFL button clicked');


        // Wait for the CSV download button to be visible and click it
        await page.waitForSelector('div.styles__rankingsButtons__V2llt > button[data-testid="button"].styles__button__gmYRZ.styles__green__aqzHf.styles__small___s6i5.styles__outline__tZkwr.styles__intrinsic__OkkMQ > div.styles__uploadIcon__n_eyz.styles__icon__ayqdB > i.styles__icon__DijND[data-testid="test-icon"] > svg[viewBox="0 0 24 24"]', { timeout: 10000 });
        console.log('CSV button visible');
        await page.click('div.styles__rankingsButtons__V2llt > button[data-testid="button"].styles__button__gmYRZ.styles__green__aqzHf.styles__small___s6i5.styles__outline__tZkwr.styles__intrinsic__OkkMQ > div.styles__uploadIcon__n_eyz.styles__icon__ayqdB > i.styles__icon__DijND[data-testid="test-icon"] > svg[viewBox="0 0 24 24"]', {delay: 2000});
        console.log('CSV button clicked');

        // Wait for the second CSV download button to be visible and click it
        await page.waitForSelector('a[href^="/rankings/download"]:has-text("CSV download")', { timeout: 10000 });
        console.log('CSV2 download button visible');
        const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click('a[href^="/rankings/download"]:has-text("CSV download")')
        ]);
        console.log('CSV2 download button clicked');

        // Save the downloaded file
        const downloadPath = path.join(__dirname, 'underdog_rankings.csv');
        await download.saveAs(downloadPath);
        console.log(`File downloaded to ${downloadPath}`);

        // Read and parse the CSV file
        const fileContent = fs.readFileSync(downloadPath, 'utf8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true
        });
        console.log('CSV file parsed into JSON');

        console.log('Scraping completed');
        return NextResponse.json({ rankings: records });
    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        console.log('Closing browser');
        await browser.close();
    }
}
