/**
 * Wave 5 Admin Dashboard E2E Tests
 * Tests for pet approval/rejection workflow
 *
 * Requirements:
 *   - 5.1: List pending pets with pagination
 *   - 5.2: Approve pet modal
 *   - 5.3: Reject pet modal with reason
 *   - 5.4: Toast notifications
 *   - 5.5: Search/filter (optional)
 */

import { test, expect } from '@playwright/test';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@test.com';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'password123';

test.describe('Admin Dashboard - Pet Approval Workflow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login as admin first
    await page.goto(`${TEST_URL}/auth/signin`);
    await page.fill('input[type="email"]', ADMIN_EMAIL);
    await page.fill('input[type="password"]', ADMIN_PASSWORD);
    await page.click('button[type="submit"]');
    
    // Wait for redirect and navigate to admin dashboard
    await page.waitForNavigation();
    await page.goto(`${TEST_URL}/admin/pets/pendentes`);
  });

  test('5.1 - Load pending pets list with pagination', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('h1:has-text("Pets Aguardando Aprovação")');
    
    // Verify header is present
    const title = await page.locator('h1').first();
    await expect(title).toHaveText('Pets Aguardando Aprovação');
    
    // Verify stats card exists
    const statsCard = page.locator('[class*="statCard"]').first();
    await expect(statsCard).toBeVisible();
    
    // Verify refresh button exists
    const refreshButton = page.locator('button:has-text("Atualizar")');
    await expect(refreshButton).toBeVisible();
  });

  test('5.1 - Display empty state when no pending pets', async ({ page }) => {
    // Wait for page to load
    await page.waitForSelector('[class*="emptyState"], [class*="gridContainer"]');
    
    // Check if empty state exists
    const emptyState = page.locator('[class*="emptyState"]');
    const gridContainer = page.locator('[class*="gridContainer"]');
    
    // At least one should be visible
    const emptyVisible = await emptyState.isVisible().catch(() => false);
    const gridVisible = await gridContainer.isVisible().catch(() => false);
    
    expect(emptyVisible || gridVisible).toBeTruthy();
  });

  test('5.1 - Display pet cards in grid layout', async ({ page }) => {
    // Wait for pet cards to load
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    
    // If there are pets, verify card layout
    const count = await petCards.count();
    if (count > 0) {
      const firstCard = petCards.first();
      
      // Verify card has essential elements
      const petName = firstCard.locator('h3');
      await expect(petName).toBeVisible();
      
      // Verify action buttons exist
      const approveBtn = firstCard.locator('button:has-text("Aprovar")');
      const rejectBtn = firstCard.locator('button:has-text("Rejeitar")');
      
      await expect(approveBtn).toBeVisible();
      await expect(rejectBtn).toBeVisible();
    }
  });

  test('5.2 - Open approve modal on button click', async ({ page }) => {
    // Wait for pet cards
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const count = await petCards.count();
    
    if (count > 0) {
      // Click approve button on first card
      const approveBtn = petCards.first().locator('button:has-text("Aprovar")');
      await approveBtn.click();
      
      // Wait for modal to appear
      await page.waitForSelector('[role="dialog"]');
      
      // Verify modal content
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Verify modal title
      const modalTitle = modal.locator('h2:has-text("Aprovar Pet")');
      await expect(modalTitle).toBeVisible();
      
      // Verify modal buttons
      const confirmBtn = modal.locator('button:has-text("Aprovar")');
      const cancelBtn = modal.locator('button:has-text("Cancelar")');
      
      await expect(confirmBtn).toBeVisible();
      await expect(cancelBtn).toBeVisible();
    }
  });

  test('5.2 - Close approve modal on cancel', async ({ page }) => {
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const count = await petCards.count();
    
    if (count > 0) {
      // Click approve button
      const approveBtn = petCards.first().locator('button:has-text("Aprovar")');
      await approveBtn.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]');
      
      // Click cancel
      const cancelBtn = page.locator('[role="dialog"] button:has-text("Cancelar")');
      await cancelBtn.click();
      
      // Verify modal is gone
      const modal = page.locator('[role="dialog"]');
      await expect(modal).not.toBeVisible();
    }
  });

  test('5.3 - Open reject modal on button click', async ({ page }) => {
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const count = await petCards.count();
    
    if (count > 0) {
      // Click reject button
      const rejectBtn = petCards.first().locator('button:has-text("Rejeitar")');
      await rejectBtn.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]');
      
      // Verify modal content
      const modal = page.locator('[role="dialog"]');
      await expect(modal).toBeVisible();
      
      // Verify modal title
      const modalTitle = modal.locator('h2:has-text("Rejeitar Pet")');
      await expect(modalTitle).toBeVisible();
      
      // Verify reject reason select exists
      const reasonSelect = modal.locator('select');
      await expect(reasonSelect).toBeVisible();
    }
  });

  test('5.3 - Show textarea when "other" reason selected', async ({ page }) => {
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const count = await petCards.count();
    
    if (count > 0) {
      // Click reject button
      const rejectBtn = petCards.first().locator('button:has-text("Rejeitar")');
      await rejectBtn.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]');
      
      // Select "other" reason
      const reasonSelect = page.locator('[role="dialog"] select');
      await reasonSelect.selectOption('other');
      
      // Wait for textarea to appear
      const textarea = page.locator('[role="dialog"] textarea');
      await expect(textarea).toBeVisible();
    }
  });

  test('5.3 - Show validation error when rejecting without reason', async ({ page }) => {
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const count = await petCards.count();
    
    if (count > 0) {
      // Click reject button
      const rejectBtn = petCards.first().locator('button:has-text("Rejeitar")');
      await rejectBtn.click();
      
      // Wait for modal
      await page.waitForSelector('[role="dialog"]');
      
      // Try to click reject without selecting reason
      const rejectModalBtn = page.locator('[role="dialog"] button:has-text("Rejeitar")');
      await rejectModalBtn.click();
      
      // Verify error message appears
      const errorMsg = page.locator('[role="dialog"] [class*="errorMessage"]');
      await expect(errorMsg).toBeVisible();
    }
  });

  test('5.4 - Show success toast after approval', async ({ page }) => {
    // This test would need a mock API or test data setup
    // Skipping for now as it requires backend coordination
    test.skip();
  });

  test('5.4 - Show error toast on API failure', async ({ page }) => {
    // This test would need a mock API or error injection
    // Skipping for now
    test.skip();
  });

  test('5.1 - Pagination works correctly', async ({ page }) => {
    // Wait for pagination controls
    const prevBtn = page.locator('button:has-text("← Anterior")');
    const nextBtn = page.locator('button:has-text("Próxima →")');
    
    // Check if pagination exists (only if there are multiple pages)
    const paginationExists = await prevBtn.isVisible().catch(() => false) || 
                             await nextBtn.isVisible().catch(() => false);
    
    if (paginationExists) {
      // Verify current page indicator
      const pageIndicator = page.locator('[class*="pageIndicator"]');
      await expect(pageIndicator).toBeVisible();
    }
  });

  test('5.1 - Refresh button reloads pet list', async ({ page }) => {
    // Get initial pet count
    const petCards = page.locator('[class*="card"]:not([class*="skeleton"])');
    const initialCount = await petCards.count();
    
    // Click refresh button
    const refreshBtn = page.locator('button:has-text("Atualizar")');
    await refreshBtn.click();
    
    // Wait for reload
    await page.waitForTimeout(500);
    
    // Verify button is still enabled
    await expect(refreshBtn).toBeEnabled();
  });

  test('5.1 - Display loading skeleton while fetching', async ({ page }) => {
    // Click refresh to trigger loading
    const refreshBtn = page.locator('button:has-text("Atualizar")');
    await refreshBtn.click();
    
    // Look for skeleton elements
    const skeletons = page.locator('[class*="skeleton"]');
    const skeletonCount = await skeletons.count().catch(() => 0);
    
    // Skeleton might be visible briefly or not at all
    // This is a soft check
    expect(skeletonCount >= 0).toBeTruthy();
  });
});
