// @ts-check
import { test, expect } from '@playwright/test';
import { SearchResultsPage } from './pages/search-results-page';
import { HomePage } from './pages/home-page';

test.beforeEach(async ({ page }) => {
    await page.goto('https://www.youtube.com/');
});

test.describe('Smoke Suite', () => {

    test('Home Button', async({ page }) => {
        await page.locator('#start').getByRole('link', { name: 'YouTube Home' }).click();
        await expect(page).toHaveURL(/^https?:\/\/(www\.)?youtube\.com\/?/);
        await expect(page).toHaveTitle("YouTube");
    });

    test('Hamburger Home', async({ page }) => {
        await page.locator('#start').getByLabel('Guide').click();
        await page.locator('tp-yt-paper-item').filter({ hasText: 'Home' }).click();
        await expect(page).toHaveURL(/^https?:\/\/(www\.)?youtube\.com\/?/);
        await expect(page).toHaveTitle("YouTube");
    });

    test('Hamburger Subscriptions', async({ page }) => {
        await page.locator('#start').getByLabel('Guide').click();
        await page.locator('tp-yt-paper-item').filter({ hasText: 'Subscriptions' }).click();
        await expect(page).toHaveURL(/^https?:\/\/(www\.)?youtube\.com\/feed\/subscriptions/);
        await expect(page).toHaveTitle("Subscriptions - YouTube");
    });

    test('Search', async({ page }) => {
        const searchResultsPage = new SearchResultsPage(page);
        await searchResultsPage.searchQuery();
        let re = await searchResultsPage.regex();
        await expect(page).toHaveURL(re);
        await expect(page).toHaveTitle(searchResultsPage.search + ' - YouTube');
    });

    test('Search and Assert Clickable Thumbnail', async({ page }) => {
        const searchResultsPage = new SearchResultsPage(page);
        await searchResultsPage.goto();
        // Wait for Shorts Shelf to load in
        await page.locator('ytd-reel-shelf-renderer #contents').nth(0).waitFor({ state: 'visible' });
        // Locate the first few results
        const searchResultsList = await searchResultsPage.searchResultsList();
        console.log(searchResultsList.length);
        for(const i in searchResultsList) {
            await searchResultsList[i].locator('#dismissible a').nth(0).hover();
            await expect(await searchResultsList[i].locator('#dismissible a').nth(0)).toHaveId('thumbnail');
            await expect(await searchResultsList[i].locator('#dismissible a').nth(0)).toHaveAttribute('href', /(watch\?v=.+$)?(shorts\/.+$)?/);
            await expect(await searchResultsList[i].locator('#dismissible a yt-image img').nth(0)).toBeVisible();
        }
    });

    test('Settings', async({ page }) => {
        await page.locator('#buttons').getByLabel('Settings').click();
        await page.locator('tp-yt-paper-item').filter({ hasText: 'Settings' }).click();
        await expect(page).not.toHaveURL(/^https?:\/\/(www\.)?youtube\.com\/?/);
    });
});