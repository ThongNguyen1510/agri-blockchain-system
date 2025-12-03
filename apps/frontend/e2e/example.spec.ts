// e2e/example.spec.ts - Tuần 10: E2E Testing với Playwright
import { test, expect } from '@playwright/test';

test.describe('AgroChain E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.locator('text=Đăng nhập')).toBeVisible();
  });

  test('should login as seller', async ({ page }) => {
    // Fill login form
    await page.fill('input[name="email"]', 'seller@agrochain.local');
    await page.fill('input[name="password"]', 'Seller123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should navigate to batches page', async ({ page }) => {
    // Login first
    await page.fill('input[name="email"]', 'seller@agrochain.local');
    await page.fill('input[name="password"]', 'Seller123!');
    await page.click('button[type="submit"]');
    
    // Wait for navigation
    await page.waitForURL(/.*dashboard/);
    
    // Navigate to batches
    await page.click('text=Quản lý Lô hàng');
    
    // Should see batches page
    await expect(page.locator('text=Quản lý Lô hàng')).toBeVisible();
  });

  test('should create a new batch', async ({ page }) => {
    // Login
    await page.fill('input[name="email"]', 'seller@agrochain.local');
    await page.fill('input[name="password"]', 'Seller123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/);
    
    // Go to batches
    await page.click('text=Quản lý Lô hàng');
    
    // Click create button
    await page.click('text=Tạo lô mới');
    
    // Fill form
    await page.fill('input[label="Mã lô"]', 'BATCH-TEST-001');
    await page.fill('input[label="Tên lô"]', 'Test Batch');
    
    // Submit
    await page.click('text=Tạo lô');
    
    // Should see success message or new batch in table
    // (Adjust based on actual implementation)
  });
});

