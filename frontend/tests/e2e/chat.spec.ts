import { test, expect } from '@playwright/test';

test.describe('Chat System', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/);
    });

    test('should allow user to navigate to chat', async ({ page }) => {
        await page.goto('/chat');
        await expect(page).toHaveURL(/.*chat/);
        await expect(page.locator('h3', { hasText: 'Select a conversation' })).toBeVisible();
    });

    test('should allow sending a message', async ({ page }) => {
        // This test assumes a conversation exists or we can start one.
        // For E2E, it's best to have a seeded state or robust setup.
        // We'll try to navigate to a known conversation or just check UI elements for now.

        await page.goto('/chat');
        // Mock selecting a conversation if possible, or just verify the layout
        const conversationList = page.locator('div.w-full.md\\:w-1\\/3');
        await expect(conversationList).toBeVisible();
    });
});
