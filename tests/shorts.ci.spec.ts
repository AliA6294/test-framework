import { test as base, expect } from '@playwright/test';
import { ShortsPage } from './pages/shorts-page';

// ShortsPage fixture that navigates to the Shorts page
const test = base.extend<{ shortsPage: ShortsPage }>({
    shortsPage: async ({ page }, use) => {
        const shortsPage = new ShortsPage(page);
        await shortsPage.goto();
        await use(shortsPage);
    }
});

test('Clicking like button should prompt sign in', async({ shortsPage }) => {
    await shortsPage.page.setViewportSize({ width: 1960, height: 1080 });

    // Click like button
    await shortsPage.likeButton.click();

    // Assert sign in prompt
    await expect(shortsPage.page.locator('tp-yt-iron-dropdown').getByText('Like this video?')).toBeVisible();
});

test('Clicking dislike button should prompt sign in', async({ shortsPage }) => {
    await shortsPage.page.setViewportSize({ width: 1960, height: 1080 });

    // Click dislike button
    await shortsPage.dislikeButton.click();

    // Assert sign in prompt
    await expect(shortsPage.page.locator('tp-yt-iron-dropdown').getByText('Don\'t like this video?')).toBeVisible();
});

test('Clicking comments button should open the comment section with an X button', async({ shortsPage }) => {
    await shortsPage.page.setViewportSize({ width: 1960, height: 1080 });

    // Click comments button
    if (await shortsPage.commentsButton.isVisible()) {
        await shortsPage.commentsButton.click();

        // Assert comments section is visible
        await expect(shortsPage.page.locator(`[id="\\3${shortsPage.shortsIterator}"]`).getByTitle('Comments')).toBeVisible();

        // Close comments section
        await shortsPage.page.getByRole('button', { name: 'Close' }).click();
    }
});

test('Clicking share button opens a popup with 12 social media platforms', async({ shortsPage }) => {
    await shortsPage.page.setViewportSize({ width: 1960, height: 1080 });

    // Click share button
    await shortsPage.clickShareButton();

    // Assert popup menu is visible
    await expect(shortsPage.page.getByRole('listbox')).toBeVisible();

    // Assert 12 social media links are visible
    const socialsList = await shortsPage.page.getByLabel('Select an application to share with').locator('yt-share-target-renderer').all();
    expect(socialsList).toHaveLength(12);

    // Close menu
    await shortsPage.page.getByLabel('Cancel').click();
});

test('Clicking more actions button opens a menu', async({ shortsPage }) => {
    await shortsPage.page.setViewportSize({ width: 1960, height: 1080 });

    // Click more actions button
    await shortsPage.moreActionsButton.click();

    // Assert that options menu shows up
    await expect(shortsPage.page.getByText('Description Captions Report Send Feedback')).toBeVisible();
});

test('Next and Previous Buttons Navigate Correctly', async({ shortsPage }) => {
    // Function to click play if visible
    async function clickPlay(): Promise<void> {
        if (await shortsPage.page.locator(`[id="\\3${shortsPage.shortsIterator}"]`).getByLabel('Play', { exact: true }).isVisible()) {
            await shortsPage.page.locator(`[id="\\3${shortsPage.shortsIterator}"]`).getByLabel('Play', { exact: true }).click();
        }
    }

    await clickPlay();

    // Get first shorts thumbnail
    const firstThumbnail = await (await shortsPage.getShortsThumbnail()).getAttribute('style');

    // Press next short button
    await shortsPage.navigateToNextShort();

    // Assert thumbnail existence
    await expect(await shortsPage.getShortsThumbnail()).toHaveAttribute('style', /.+frame0\.jpg/);

    // Get second shorts thumbnail
    const secondThumbnail = await (await shortsPage.getShortsThumbnail()).getAttribute('style');

    await clickPlay();

    // Assert thumbnail change
    expect(secondThumbnail).not.toBe(firstThumbnail);

    await clickPlay();

    // Check previous short in the shorts inner container
    await expect(shortsPage.page.locator(`[id="\\3${shortsPage.shortsIterator--}"]`).locator('.player-container')).toHaveAttribute('style', /.+frame0\.jpg/);
    const currentThumbnail = await (shortsPage.page.locator(`[id="\\3${shortsPage.shortsIterator--}"]`).locator('.player-container')).getAttribute('style');
    
    // Assert that the previous short is the first short and not the second
    expect(currentThumbnail).toBe(firstThumbnail);
    expect(currentThumbnail).not.toBe(secondThumbnail);
});