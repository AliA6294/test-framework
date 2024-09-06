import { test as base, expect } from '@playwright/test';
import { test } from './fixtures/fixtures'

test.beforeEach(async ({ searchResultsPage }) => {
    await searchResultsPage.goto();
});

test('Navigate to proper search page after searching', async({ searchResultsPage }) => {
    // Navigate to home page
    await searchResultsPage.clickHomeButton();

    // Submit search
    await searchResultsPage.searchQuery(searchResultsPage.getSearch());

    // Assert URL navigated to appropriate search page
    let searchRegex = await searchResultsPage.getSearchQueryRegex();
    await expect(searchResultsPage.page).toHaveURL(searchRegex);

    // Assert appropriate search results page title
    await expect(searchResultsPage.page).toHaveTitle(searchResultsPage.getSearch() + ' - YouTube');
});

test('Search results contain clickable videos with thumbnails', async({ searchResultsPage }) => {
    // Use the home button as an indicator for the page being loaded
    await searchResultsPage.homeButton.waitFor({ state: 'visible' });

    // Locate the first few dynamically loaded results
    const searchResultsList = await searchResultsPage.getVideoSearchResultsList();
    console.log(searchResultsList.length);
    expect(searchResultsList.length).toBeGreaterThan(0);

    // Loop through located results
    for(const result of searchResultsList) {
        // Locate thumbnail
        const thumbnail = result.locator('#dismissible a').nth(0);
        await thumbnail.hover();
        await expect(thumbnail).toHaveId('thumbnail');

        // Assert thumbnail links to a video
        await expect(thumbnail).toHaveAttribute('href', /(watch\?v=.+$)?(shorts\/.+$)?/);

        // Assert thumbnail visibility
        await expect(thumbnail.locator('yt-image img')).toBeVisible();
    }
});

test('Can filter search results', async({ searchResultsPage }) => {
    // Open filter menu
    await searchResultsPage.filterButton.isVisible();
    await searchResultsPage.filterButton.click();

    // Assert filters are visible
    const filtersMenu = searchResultsPage.page.locator('yt-formatted-string').filter({ hasText: 'Search filters' });
    await expect(filtersMenu).toBeVisible();

    // Declare variables for the filter table
    const columns = await searchResultsPage.getFilterColumns();
    const sortByColumn = columns[4];
    const sortByRows = await searchResultsPage.getRowsInFilterColumn(sortByColumn);

    // Get Relevance filter
    const relevanceFilter = sortByRows[0];

    // Assert that Relevance filter is selected by default
    await expect(relevanceFilter).toHaveClass(/selected/);

    // Get Live filter
    const featuresColumn = columns[3];
    const featuresRows = await searchResultsPage.getRowsInFilterColumn(featuresColumn);
    const liveFilter = featuresRows[0];

    // Apply Live filter
    await liveFilter.locator('a').click();
    await searchResultsPage.page.waitForTimeout(2000);

    // Assert URL change due to filtering
    await expect(searchResultsPage.page).toHaveURL(/^https?:\/\/(www\.)?youtube\.com\/results\?search_query=.+&sp=.+$/);

    // Assert visibility of Live badges on the filtered results
    const liveBadges = await searchResultsPage.page.getByLabel('LIVE', { exact: true }).all();
    for (let i = 0; i < liveBadges.length; i++) {
        await expect(liveBadges[i]).toBeVisible();
    }

    // Apply filter
    await searchResultsPage.filterButton.click();

    // Assert filter is selected
    await expect(liveFilter).toHaveClass(/selected/);

    // Dismiss filter
    const dismissLiveFilterButton = searchResultsPage.page.getByTitle('Remove Live filter');
    await dismissLiveFilterButton.click();
    await searchResultsPage.page.waitForTimeout(2000);

    // Open filter menu
    await searchResultsPage.filterButton.click();

    // Assert filter is no longer selected
    await expect(liveFilter).not.toHaveClass(/selected/);
});