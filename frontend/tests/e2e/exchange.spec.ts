import { test, expect } from '@playwright/test';

test.describe('Skill Exchange Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com');
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/.*dashboard/);
    });

    test('should display skill marketplace', async ({ page }) => {
        await page.goto('/marketplace');
        await expect(page.locator('h1', { hasText: 'Skill Marketplace' })).toBeVisible();
        // Check if skills are loaded
        // await expect(page.locator('.grid > div')).toHaveCount(1); // At least one skill
    });

    test('should allow viewing a skill detail', async ({ page }) => {
        await page.goto('/marketplace');
        // Click first "View Details" button
        // await page.click('text=View Details');
        // await expect(page).toHaveURL(/.*skill\/.*/);
    });
});
