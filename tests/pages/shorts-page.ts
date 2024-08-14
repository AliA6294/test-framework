import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './page';

export class ShortsPage extends BasePage {
    shortsIterator: number;
    readonly likeButton: Locator;
    readonly dislikeButton: Locator;
    readonly commentsButton: Locator;
    readonly moreActionsButton: Locator;
    readonly nextShortButton: Locator;
    readonly previousShortButton: Locator;
    readonly shortsPlayer: Locator;
    readonly volumeButton: Locator;
    readonly volume: Locator;
    
    constructor(page: Page) {
        super(page);
        this.shortsIterator = 0;
        this.likeButton = page.locator('#like-button').getByLabel('like this video along with');
        this.dislikeButton = page.locator('#dislike-button').getByLabel('Dislike this video');
        this.commentsButton = page.locator(`[id="\\3${this.shortsIterator}"]`).locator('#comments-button button');
        this.moreActionsButton = page.getByRole('button', { name: 'More actions' });
        this.nextShortButton = page.getByLabel('Next video');
        this.previousShortButton = page.getByLabel('Previous video');
        this.shortsPlayer = page.locator(`[id="\\3${this.shortsIterator}"]`).locator('#shorts-player');
        this.volumeButton = page.locator(`[id="\\3${this.shortsIterator}"]`).locator('.YtdDesktopShortsVolumeControlsMuteIconButton');
        this.volume = page.locator(`[id="\\3${this.shortsIterator}"]`).getByLabel('Volume');
    }

    async regex(): Promise<RegExp> {
        let regex = /^https?:\/\/(www\.)?youtube\.com\/shorts\/.+$/;
        return regex;
    }

    async goto() {
        await this.page.goto('https://www.youtube.com/shorts/');
        await this.page.waitForURL(await this.regex());
    }

    async navigateToNextShort() {
        await this.nextShortButton.click();
        this.shortsIterator++;
    }

    async navigateToPreviousShort() {
        await this.previousShortButton.click();
        this.shortsIterator--;
    }

    async goForward() {
        await this.page.goForward({ waitUntil: 'networkidle' });
        this.shortsIterator++;
    }

    async goBack() {
        await this.page.goBack({ waitUntil: 'networkidle' });
        this.shortsIterator--;
    }

    async clickShareButton() {
        await this.page.locator(`[id="\\3${this.shortsIterator}"]`).getByRole('button', { name: 'Share' }).click();
    }

    async getShortsVideo() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).locator('#shorts-player video');
    }

    async getShortsThumbnail() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).locator('.player-container');
    }

    async getShortsPlayer() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).locator('#shorts-player');
    }

    async getVolumeButton() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).locator('.YtdDesktopShortsVolumeControlsMuteIconButton');
    }

    async getVolume() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).getByLabel('Volume');
    }

    async getPlayButton() {
        return this.page.locator(`[id="\\3${this.shortsIterator}"]`).getByLabel('Play (k)', { exact: true });
    }
}