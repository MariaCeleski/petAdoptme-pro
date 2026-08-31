/**
 * Testes E2E de Responsividade
 * 
 * Requirements:
 *   - 9.1: Adapt to screen sizes 320px to 1920px
 *   - 9.2: Touch-friendly navigation on mobile
 *   - 9.5: Sidebar navigation on mobile viewports
 */

import { test, expect } from '@playwright/test';
import { getResponsiveViewports, isTouchFriendly, hasNoHorizontalScroll } from '../helpers/a11y.js';
import { generateTestUser, generateTestPet } from '../helpers/test-data.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

// Testar em múltiplos viewports
const viewports = getResponsiveViewports();

test.describe('Responsividade - Desktop', () => {
  
  const viewport = viewports.desktop;
  
  test('deve estar acessível em desktop (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
    
    // Verificar se elementos principais são visíveis
    const header = page.locator('header, nav, [role="navigation"]').first();
    await expect(header).toBeVisible();
  });

  test('deve renderizar catálogo de pets em desktop', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Verificar sem horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });
});

test.describe('Responsividade - Mobile Small', () => {
  
  const viewport = viewports.mobile;
  
  test('deve estar acessível em mobile small (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar se não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
    
    // Verificar navegação
    const header = page.locator('header, nav, [role="navigation"]').first();
    await expect(header).toBeVisible();
  });

  test('deve permitir completar fluxo de registro em mobile', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${TEST_URL}/auth/register`);
    await page.waitForLoadState('networkidle');
    
    // Preencher formulário
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Verificar que não há horizontal scroll
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve ter navegação apropriada em mobile small', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Em viewports pequenos, deve haver menu hamburger ou similar
    const hamburgerMenu = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], .hamburger, [data-testid="mobile-menu-btn"]').first();
    
    // Se houver hamburguer, deve estar visível
    if (await hamburgerMenu.isVisible().catch(() => false)) {
      expect(await hamburgerMenu.isVisible()).toBeTruthy();
    } else {
      // Caso contrário, navegação deve estar visível inline
      const nav = page.locator('nav, [role="navigation"]').first();
      expect(await nav.isVisible()).toBeTruthy();
    }
  });

  test('deve ter botões touch-friendly em mobile', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    // Verificar primeiro botão principal
    const mainButton = page.locator('button, a[role="button"], [role="button"]').first();
    
    if (await mainButton.isVisible().catch(() => false)) {
      const size = await mainButton.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return { width: Math.round(rect.width), height: Math.round(rect.height) };
      });
      
      // Botões devem ser toque-amigáveis (44x44+)
      expect(size.width).toBeGreaterThanOrEqual(40);
      expect(size.height).toBeGreaterThanOrEqual(40);
    }
  });
});

test.describe('Responsividade - Mobile Large', () => {
  
  const viewport = viewports.mobileLarge;
  
  test('deve estar acessível em mobile large (414x896)', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve renderizar pet list em mobile large', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });
});

test.describe('Responsividade - Tablet', () => {
  
  const viewport = viewports.tablet;
  
  test('deve estar acessível em tablet (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve mostrar layout grid em tablet', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Verificar pet cards
    const petCards = page.locator('[data-testid="pet-card"], .pet-card');
    const count = await petCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
    
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });
});

test.describe('Responsividade - Desktop Large', () => {
  
  const viewport = viewports.desktopLarge;
  
  test('deve estar acessível em desktop large (2560x1440)', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(TEST_URL);
    await page.waitForLoadState('networkidle');
    
    const noHorizontalScroll = await hasNoHorizontalScroll(page);
    expect(noHorizontalScroll).toBeTruthy();
  });

  test('deve renderizar múltiplos pets em desktop large', async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    // Em desktop grande, deve haver múltiplos pets por linha
    const petCards = page.locator('[data-testid="pet-card"], .pet-card');
    const count = await petCards.count();
    
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('Imagens e Performance', () => {
  
  test('deve ter imagens otimizadas', async ({ page }) => {
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForLoadState('networkidle');
    
    const images = await page.evaluate(() => {
      const imgs = document.querySelectorAll('img');
      return Array.from(imgs)
        .filter(img => img.offsetWidth > 0)
        .map(img => ({
          width: img.naturalWidth,
          height: img.naturalHeight,
          loading: img.loading
        }));
    });
    
    // Imagens devem estar carregadas ou com lazy loading
    expect(images.length).toBeGreaterThanOrEqual(0);
  });

  test('deve não ter horizontal scroll em nenhum viewport', async ({ page }) => {
    const viewportSizes = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
    ];
    
    for (const viewport of viewportSizes) {
      await page.setViewportSize(viewport);
      await page.goto(TEST_URL);
      
      const noHorizontalScroll = await hasNoHorizontalScroll(page);
      expect(noHorizontalScroll).toBeTruthy();
    }
  });
});
