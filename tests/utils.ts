import fs from 'fs';
import { BasePage } from './pages/page';
import { expect } from '@playwright/test';

export function loadTestData(filePath: string) {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        console.error(`Error loading test data from ${filePath}:`, error);
        throw new Error(`Failed to load test data from ${filePath}`);
    }
}

export async function authenticate(pageObject: BasePage, maxRetries = 2): Promise<void> {
    let retries = 0;
    let success = false;

    while (!success && retries <= maxRetries) {
        try {
            const cookies = parseCookies();
            const storageData = parseLocalStorage();

            console.log('Loading cookies and local storage...');
            await pageObject.page.context().addCookies(cookies);
            await pageObject.page.context().addInitScript((storage: Record<string, string>) => {
                Object.keys(storage).forEach(key => window.localStorage.setItem(key, storage[key]));
            }, storageData);

            await pageObject.page.context().storageState(storageData);
            
            console.log('Reloading page to ensure storage is recognized...');
            await pageObject.page.reload();
            
            // Verify authentication was successful
            await expect(await pageObject.getLoginButton()).not.toBeVisible({ timeout: 5000 });
            await expect(await pageObject.getAccountMenu()).toBeVisible({ timeout: 5000 });
            
            success = true;
            console.log('Authentication successful');
        } catch (error) {
            retries++;
            console.error(`Authentication attempt ${retries} failed:`, error);
            if (retries > maxRetries) {
                throw new Error('Authentication failed after maximum retries');
            }
            // Wait before retrying
            await pageObject.page.waitForTimeout(2000);
        }
    }
}

function parseCookies(): any[] {
    console.log('Grabbing cookies...');
    try {
        // Parse cookies from GH Secrets, or from /auth folder
        return process.env.CI ? JSON.parse(process.env.COOKIES_JSON || '[]')
            : JSON.parse(fs.readFileSync('tests/auth/cookies.json', 'utf8'));
    } catch (error) {
        console.error('Error parsing cookies:', error);
        return [];
    }
}

function parseLocalStorage(): Record<string, string> {
    console.log('Grabbing storage...');
    try {
        // Parse Local Storage from GH Secrets, or from /auth folder
        return process.env.CI ? JSON.parse(process.env.LOCAL_STORAGE_JSON || '{}')
            : JSON.parse(fs.readFileSync('tests/auth/localStorage.json', 'utf8'));
    } catch (error) {
        console.error('Error parsing local storage:', error);
        return {};
    }
}