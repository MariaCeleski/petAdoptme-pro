/**
 * Fixtures para autenticação nos testes E2E
 * 
 * Requirements:
 *   - Testar autenticação e dashboard (17.2: 1.1-1.7)
 */

import { test as base } from '@playwright/test';

export const authFixture = base.extend({
  /**
   * Fixture que fornece funções de autenticação
   */
  authHelper: async ({ page }, use) => {
    const helper = {
      /**
       * Login com email e senha
       * @param {string} email 
       * @param {string} password 
       */
      login: async (email, password) => {
        await page.goto('/auth/login');
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|pets)/);
      },

      /**
       * Registro de novo usuário
       * @param {object} userData 
       */
      register: async (userData) => {
        await page.goto('/auth/register');
        await page.fill('input[name="email"]', userData.email);
        await page.fill('input[name="name"]', userData.name);
        await page.fill('input[name="password"]', userData.password);
        await page.fill('input[name="confirmPassword"]', userData.password);
        
        // Se houver seletor de tipo de usuário
        if (userData.userType) {
          await page.selectOption('select[name="userType"]', userData.userType);
        }

        await page.click('button[type="submit"]');
        // Aguardar confirmação ou redirecionamento
        await page.waitForNavigation();
      },

      /**
       * Logout
       */
      logout: async () => {
        // Aguardar pelo menos um elemento da página estar pronto
        await page.waitForSelector('body');

        // Tentar encontrar menu ou botão de logout
        const userMenu = page.locator('button:has-text("Perfil"), button:has-text("Minha Conta"), [data-testid="user-menu"]').first();
        
        if (await userMenu.isVisible().catch(() => false)) {
          await userMenu.click();
          await page.click('button:has-text("Sair"), a:has-text("Logout"), [data-testid="logout-btn"]');
        }

        await page.waitForURL('/');
      },

      /**
       * Criar usuário de teste via API
       */
      createTestUser: async (email, password, userType = 'ADOPTER') => {
        const response = await page.request.post('/api/auth/test/create-user', {
          data: { email, password, userType, name: 'Test User' }
        });
        return response.json();
      },

      /**
       * Deletar usuário de teste via API
       */
      deleteTestUser: async (userId) => {
        await page.request.delete(`/api/auth/test/delete-user/${userId}`);
      },
    };

    await use(helper);
  },

  /**
   * Fixture que fornece usuário autenticado
   */
  authenticatedPage: async ({ page, authHelper }, use) => {
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await authHelper.login(testEmail, testPassword);
    await use(page);
  },

  /**
   * Fixture que fornece página com usuário Pet Owner autenticado
   */
  petOwnerPage: async ({ page, authHelper }, use) => {
    const testEmail = `petowner-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await authHelper.register({
      email: testEmail,
      name: 'Test Pet Owner',
      password: testPassword,
      userType: 'INDIVIDUAL_OWNER'
    });
    
    await authHelper.login(testEmail, testPassword);
    await use(page);
  },

  /**
   * Fixture que fornece página com usuário Adotante autenticado
   */
  adopterPage: async ({ page, authHelper }, use) => {
    const testEmail = `adopter-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await authHelper.register({
      email: testEmail,
      name: 'Test Adopter',
      password: testPassword,
      userType: 'ADOPTER'
    });
    
    await authHelper.login(testEmail, testPassword);
    await use(page);
  },

  /**
   * Fixture que fornece página com usuário Shelter Admin autenticado
   */
  shelterAdminPage: async ({ page, authHelper }, use) => {
    const testEmail = `shelter-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    await authHelper.register({
      email: testEmail,
      name: 'Test Shelter Admin',
      password: testPassword,
      userType: 'SHELTER_ADMIN'
    });
    
    await authHelper.login(testEmail, testPassword);
    await use(page);
  },
});

export { expect } from '@playwright/test';
