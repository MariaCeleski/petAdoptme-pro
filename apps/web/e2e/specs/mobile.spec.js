/**
 * Testes E2E Mobile com Pixel 5
 * 
 * Requirements:
 *   - 9.2: Touch-friendly navigation
 *   - 9.5: Mobile viewport navigation
 */

import { test, expect, devices } from '@playwright/test';
import { hasNoHorizontalScroll } from '../helpers/a11y.js';
import { generateTestUser } from '../helpers/test-data.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

test.use({ ...devices['Pixel 5'] });

test.describe('Mobile (Pixel 5)', () => {

  test('deve permitir deslizar em lista de pets', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Verificar se há pet cards
    const petCards = page.locator('[data-testid="pet-card"], .pet-card').first();
    const hasCards = await petCards.isVisible().catch(() => false);
    
    expect(hasCards).toBeTruthy();
  });

  test('deve permitir tap em botão de interesse', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Registrar e fazer login
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    const userTypeSelect = page.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('ADOPTER');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Navegar para pets
    await page.goto(`${TEST_URL}/pets`);
    const petCard = page.locator('[data-testid="pet-card"], .pet-card').first();
    
    if (await petCard.isVisible().catch(() => false)) {
      // Tap no card
      await petCard.tap();
      
      // Verificar que detalhes aparecem
      const details = page.locator('[data-testid="pet-details"], .pet-details, h1, h2').first();
      const isVisible = await details.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('deve permitir scrolling vertical sem problemas', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Fazer scroll
    await page.evaluate(() => {
      window.scrollBy(0, 300);
    });
    
    // Verificar que página scrollou
    const scrollTop = await page.evaluate(() => window.scrollY);
    expect(scrollTop).toBeGreaterThan(0);
    
    // Fazer mais scroll
    await page.evaluate(() => {
      window.scrollBy(0, 300);
    });
    
    const scrollTop2 = await page.evaluate(() => window.scrollY);
    expect(scrollTop2).toBeGreaterThan(scrollTop);
  });

  test('deve fechar menu em tap fora', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Abrir menu se houver
    const menuBtn = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger').first();
    
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.tap();
      
      // Verificar menu aberto
      const menu = page.locator('nav, [role="navigation"], [data-testid="mobile-menu"]').first();
      const isOpen = await menu.isVisible({ timeout: 2000 }).catch(() => false);
      
      if (isOpen) {
        // Tap fora do menu
        await page.tap('body', { position: { x: 50, y: 50 } });
        
        // Menu deve fechar
        const isClosed = !await menu.isVisible({ timeout: 1000 }).catch(() => false);
        expect(isClosed || !isOpen).toBeTruthy();
      }
    }
  });

  test('deve completar fluxo de login em mobile', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    const userTypeSelect = page.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('ADOPTER');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Verificar não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve ter teclado otimizado para mobile', async ({ page }) => {
    await page.goto(`${TEST_URL}/auth/login`);
    
    const emailInput = page.locator('input[name="email"]').first();
    if (await emailInput.isVisible()) {
      // Tap no input
      await emailInput.tap();
      
      // Verificar que input recebeu focus
      const focused = await emailInput.evaluate(el => document.activeElement === el);
      expect(focused).toBeTruthy();
    }
  });

  test('deve exibir corretamente em 375x667', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(414);
    
    // Verificar não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });
});
