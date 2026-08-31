/**
 * Testes E2E de Autenticação
 * 
 * Requirements:
 *   - 1.1: Email/password authentication
 *   - 1.2: OAuth Google authentication
 *   - 1.3: Email verification
 *   - 1.4: Password strength validation
 *   - 1.5: Error messages
 *   - 1.6: JWT session management
 *   - 1.7: Password reset
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestEmail } from '../helpers/test-data.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Autenticação - Fluxo Completo', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test('deve registrar novo usuário com email e senha', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Navegar para registro
    await page.click('a:has-text("Registrar"), button:has-text("Cadastro"), a:has-text("Sign Up")');
    await page.waitForURL(/\/auth\/register|\/register/);
    
    // Preencher formulário
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    // Selecionar tipo de usuário se necessário
    const userTypeSelect = page.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('ADOPTER');
    }
    
    // Submeter
    await page.click('button[type="submit"]');
    
    // Verificar redirecionamento ou mensagem de sucesso
    const successMessage = page.locator('text=Sucesso, text=Success, [data-testid="success-message"]').first();
    const isSuccessful = await successMessage.isVisible().catch(async () => {
      return page.url().includes('/dashboard') || page.url().includes('/login');
    });
    
    expect(isSuccessful).toBeTruthy();
  });

  test('deve fazer login com credenciais válidas', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Primeiro, criar o usuário
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento
    await page.waitForURL(/\/dashboard|\/login|\//, { timeout: 5000 });
    
    // Se não fez login automático, fazer login manualmente
    const url = page.url();
    if (url.includes('/login') || !url.includes('/dashboard')) {
      await page.goto(`${TEST_URL}/auth/login`);
      await page.fill('input[name="email"]', testUser.email);
      await page.fill('input[name="password"]', testUser.password);
      await page.click('button[type="submit"]');
    }
    
    // Verificar login bem-sucedido
    await page.waitForURL(/\/dashboard|\/pets/, { timeout: 5000 });
    const isDashboard = page.url().includes('/dashboard') || page.url().includes('/pets');
    expect(isDashboard).toBeTruthy();
  });

  test('deve rejeitar login com credenciais inválidas', async ({ page }) => {
    await page.goto(`${TEST_URL}/auth/login`);
    
    // Tentar login com credenciais erradas
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');
    
    // Verificar mensagem de erro
    const errorMessage = page.locator('text=inválido, text=invalid, text=não encontrado, [data-testid="error-message"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  test('deve validar força da senha durante registro', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    
    // Tentar senha fraca (menos de 8 caracteres)
    await page.fill('input[name="password"]', 'weak');
    
    // Verificar se há mensagem de erro ou botão desabilitado
    const submitBtn = page.locator('button[type="submit"]');
    const isDisabled = await submitBtn.isDisabled().catch(() => false);
    const errorMsg = page.locator('text=mínimo, text=minimum, text=8 caracteres').first();
    
    const hasValidation = isDisabled || await errorMsg.isVisible().catch(() => false);
    expect(hasValidation).toBeTruthy();
  });

  test('deve fazer logout e redirecionar para home', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Registrar e fazer login
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Fazer logout
    const userMenu = page.locator('button:has-text("Perfil"), button:has-text("Account"), [data-testid="user-menu"]').first();
    await userMenu.click().catch(() => {});
    
    const logoutBtn = page.locator('button:has-text("Sair"), button:has-text("Logout"), a:has-text("Logout")').first();
    await logoutBtn.click().catch(() => {});
    
    // Verificar redirecionamento
    await page.waitForURL(/\/$|\/home|\//, { timeout: 5000 });
    
    // Verificar que não está mais autenticado
    const loginLink = page.locator('a:has-text("Login"), a:has-text("Entrar")').first();
    const isNotAuthenticated = await loginLink.isVisible({ timeout: 2000 }).catch(() => false);
    expect(isNotAuthenticated).toBeTruthy();
  });

  test('deve redirecionar para login ao acessar página protegida sem autenticação', async ({ page }) => {
    // Tentar acessar dashboard sem autenticação
    await page.goto(`${TEST_URL}/dashboard`);
    
    // Deve redirecionar para login
    await page.waitForURL(/\/auth\/login|\/login/, { timeout: 5000 });
    expect(page.url()).toContain('login');
  });

  test('deve manter sessão após refresh da página', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Fazer login
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Fazer refresh
    await page.reload();
    
    // Verificar que ainda está autenticado
    const isDashboard = page.url().includes('/dashboard') || page.url().includes('/pets');
    expect(isDashboard).toBeTruthy();
  });

  test('deve mostrar email do usuário na sessão', async ({ page }) => {
    const testUser = generateTestUser('ADOPTER');
    
    // Fazer login
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Verificar se email está visível em algum lugar (header, menu, etc)
    const emailVisible = await page.locator(`text=${testUser.email}`).first().isVisible().catch(() => false);
    expect(emailVisible).toBeTruthy();
  });
});
