import { type Locator, type Page } from '@playwright/test';

export abstract class BasePage {
    readonly page: Page;
    readonly homeButton: Locator;
    readonly guide: Locator;
    readonly searchButton: Locator;
    readonly voiceButton: Locator;
    readonly defaultTimeout = 10000;

    constructor(page: Page) {
        this.page = page;
        this.homeButton = page.locator('#start').getByRole('link', { name: 'YouTube Home' });
        this.guide = page.locator('#start #guide-button').getByLabel('Guide');
        this.searchButton = page.getByRole('button', { name: 'Search', exact: true });
        this.voiceButton = page.getByLabel('Search with your voice');
    }

    // Utility method to safely perform actions with retry
    async safeAction(action: () => Promise<void>, actionName: string, maxRetries = 3): Promise<void> {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                await action();
                return;
            } catch (error) {
                attempts++;
                console.warn(`${actionName} failed (attempt ${attempts}/${maxRetries}): ${error}`);
                if (attempts >= maxRetries) {
                    throw new Error(`${actionName} failed after ${maxRetries} attempts: ${error}`);
                }
                await this.page.waitForTimeout(1000);
            }
        }
    }

    // Clicks YouTube logo home button
    async clickHomeButton(): Promise<void> {
        console.log('Clicking home button...');
        await this.safeAction(async () => {
            await this.homeButton.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await this.homeButton.click();
        }, 'Click home button');
    }

    // Opens hamburger guide menu
    async openGuideMenu(): Promise<void> {
        console.log('Opening guide menu...');
        await this.safeAction(async () => {
            await this.guide.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            const isGuideOpen = await this.guide.getAttribute('aria-selected') === 'true';
            if (!isGuideOpen) {
                await this.guide.click();
                // Wait for guide menu to be fully visible
                await this.page.waitForSelector('#guide-content', { state: 'visible', timeout: this.defaultTimeout });
            } else {
                console.log('Guide menu is already open.');
            }
        }, 'Open guide menu');
    }

    async getGuideCloseButton(): Promise<Locator> {
        return this.page.locator('#guide-content #button');
    }

    // Click search button
    async submitSearch(): Promise<void> {
        console.log('Clicking search button...');
        //await this.searchButton.click();
        //await this.searchButton.click();
        //await this.searchButton.click(); // Three separate clicks for it to go throug
        await this.safeAction(async () => {
            await this.searchButton.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await this.searchButton.click();
            // Wait for search results to appear
            await this.page.waitForLoadState('networkidle', { timeout: this.defaultTimeout });
        }, 'Submit search');
    }

    // Input string into search bar and submit
    async searchQuery(input: string): Promise<void> {
        console.log(`Searching for ${input} ...`);
        await this.safeAction(async () => {
            const searchBox = this.page.getByRole('combobox', { name: 'Search' });
            await searchBox.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await searchBox.fill(input);
            await this.submitSearch();
        }, 'Search query');
    }

    // Clicks search with voice button
    async clickVoiceButton(): Promise<void> {
        console.log('Clicking voice button...');
        await this.safeAction(async () => {
            await this.voiceButton.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await this.voiceButton.click();
        }, 'Click voice button');
    }

    async getLoginButton(): Promise<Locator> {
        return this.page.getByLabel('Sign in');
    }

    async getAccountMenu(): Promise<Locator> {
        return this.page.getByLabel('Account menu');
    }

    // Opens guide menu and clicks indicated button
    async navigateToGuideItem(page: 'Home' | 'Shorts' | 'Subscriptions' | 'You' | 'History'): Promise<void> {
        console.log(`Navigating to ${page}...`);
        await this.safeAction(async () => {
            await this.openGuideMenu();
            const item = this.page.locator('#sections').getByTitle(`${page}`, { exact: true });
            await item.waitFor({ state: 'visible', timeout: this.defaultTimeout });
            await item.click();
            await this.page.waitForLoadState('networkidle', { timeout: this.defaultTimeout });
        }, `Navigate to ${page}`);
    }

    // Goto with waiting for page to load
    async goto(path: string = ''): Promise<void> {
        const url = new URL(path, this.page.url()).toString();
        console.log(`Navigating to ${url}`);
        await this.safeAction(async () => {
            await this.page.goto(url);
            await this.page.waitForLoadState('domcontentloaded');
            await this.page.waitForLoadState('networkidle', { timeout: this.defaultTimeout });
        }, 'Page navigation');
    }
}