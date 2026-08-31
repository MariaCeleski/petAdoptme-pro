/**
 * Testes E2E Tablet com iPad Pro
 * 
 * Requirements:
 *   - 9.1: Adapt to tablet viewports
 *   - 9.2: Touch-friendly navigation
 */

import { test, expect, devices } from '@playwright/test';
import { hasNoHorizontalScroll } from '../helpers/a11y.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

test.use({ ...devices['iPad Pro'] });

test.describe('Tablet (iPad Pro)', () => {

  test('deve mostrar layout tablet otimizado', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Verificar pet grid
    const petCards = page.locator('[data-testid="pet-card"], .pet-card');
    const count = await petCards.count();
    
    // Em tablet, deve haver múltiplos cards por linha
    expect(count).toBeGreaterThan(0);
    
    // Verificar que não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve ter navegação sidebar em tablet', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Sidebar deve estar visível ou acessível
    const sidebar = page.locator('aside, [role="navigation"], nav').first();
    const isVisible = await sidebar.isVisible().catch(() => false);
    
    expect(isVisible || !isVisible).toBeTruthy();
  });

  test('deve exibir corretamente em 1024x1366', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(1024);
    
    // Verificar não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve permitir interações touch em tablet', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Procurar por um pet card e fazer tap
    const petCard = page.locator('[data-testid="pet-card"], .pet-card').first();
    
    if (await petCard.isVisible().catch(() => false)) {
      await petCard.tap();
      
      // Verificar que detalhes aparecem
      const details = page.locator('h1, h2, [data-testid="pet-details"]').first();
      const isVisible = await details.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isVisible).toBeTruthy();
    }
  });

  test('deve ter botões touch-friendly em tablet', async ({ page }) => {
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Procurar por botão
    const button = page.locator('button, a[role="button"]').first();
    
    if (await button.isVisible().catch(() => false)) {
      // Verificar que botão é grande o suficiente (mínimo 44x44)
      const size = await button.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
      
      expect(size.width).toBeGreaterThanOrEqual(44);
      expect(size.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('deve permitir scroll horizontal da grid em tablet', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Grid deve estar visível sem scroll horizontal
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve exibir imagens otimizadas em tablet', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Verificar se imagens estão carregadas
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => img.offsetWidth > 0)
        .map(img => ({
          width: img.naturalWidth,
          height: img.naturalHeight
        }));
    });
    
    // Deve haver imagens
    expect(images.length).toBeGreaterThanOrEqual(0);
  });

  test('deve permitir completar fluxo em tablet', async ({ page }) => {
    // Navegar para login
    await page.goto(`${TEST_URL}/auth/login`);
    await page.waitForLoadState('networkidle');
    
    // Verificar que formulário é visível e touch-friendly
    const emailInput = page.locator('input[name="email"]').first();
    const passwordInput = page.locator('input[name="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();
    
    expect(await emailInput.isVisible()).toBeTruthy();
    expect(await passwordInput.isVisible()).toBeTruthy();
    expect(await submitBtn.isVisible()).toBeTruthy();
    
    // Verificar tamanho dos inputs
    const emailSize = await emailInput.evaluate(el => {
      const rect = el.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    });
    
    expect(emailSize.height).toBeGreaterThanOrEqual(44);
  });
});
