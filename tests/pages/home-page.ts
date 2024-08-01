import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';

export class HomePage extends BasePage {
    readonly videoRow: Locator;
    readonly body: Locator;
    readonly getStartedTitle: Locator;
    readonly getStartedSubtitle: Locator;
    
    constructor(page: Page) {
        super(page);
        this.videoRow = page.locator('ytd-rich-grid-row');
        this.body = page.locator('contents').locator('ytd-rich-grid-renderer');
        this.getStartedTitle = page.getByLabel('Try searching to get started');
        this.getStartedSubtitle = page.getByLabel('Start watching videos to help');
    }

    async goto() {
        await this.page.goto('/');
    }

    async regex() {
        let regex = /^https?:\/\/(www\.)?youtube\.com\/?/;
        return regex;
    }

    async chipsList() {
        return this.page.getByRole('tab').all();
    }
}