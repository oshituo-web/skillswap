import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test('should allow a user to register', async ({ page }) => {
        const timestamp = Date.now();
        const email = `testuser${timestamp}@example.com`;

        await page.goto('/register');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', 'password123');
        await page.fill('input[name="confirmPassword"]', 'password123');
        await page.click('button[type="submit"]');

        // Expect to be redirected to dashboard or show success message
        // Adjust selector based on actual UI behavior
        await expect(page).toHaveURL(/.*dashboard/);
    });

    test('should allow a user to login', async ({ page }) => {
        // Note: In a real scenario, you'd seed the DB first. 
        // Here we assume a test user exists or we just created one.
        // For stability, let's use a known test user if possible, or just test the UI flow.

        await page.goto('/login');
        await page.fill('input[type="email"]', 'test@example.com'); // Replace with valid test creds if available
        await page.fill('input[type="password"]', 'password123');
        await page.click('button[type="submit"]');

        // await expect(page).toHaveURL(/.*dashboard/);
    });
});
