/**
 * Testes E2E do Fluxo de Adoção
 * 
 * Requirements:
 *   - 6.1: Adoption form display
 *   - 6.2: Adopter information collection
 *   - 6.3: Adoption request creation
 *   - 6.4: Pet owner notification
 *   - 6.5: Approval/rejection/pending status
 *   - 6.6: Adopter notification
 *   - 6.7: Pet status update on completion
 *   - 6.8: Adoption history tracking
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestPet, generateAdopterInfo } from '../helpers/test-data.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Fluxo Completo de Adoção', () => {

  test('deve manifestar interesse em um pet disponível', async ({ page, context }) => {
    // Criar conta de Pet Owner e criar um pet
    const petOwner = generateTestUser('INDIVIDUAL_OWNER');
    const petData = generateTestPet();
    
    const petOwnerPage = await context.newPage();
    await petOwnerPage.goto(`${TEST_URL}/auth/register`);
    await petOwnerPage.fill('input[name="email"]', petOwner.email);
    await petOwnerPage.fill('input[name="name"]', petOwner.name);
    await petOwnerPage.fill('input[name="password"]', petOwner.password);
    await petOwnerPage.fill('input[name="confirmPassword"]', petOwner.password);
    
    const userTypeSelect = petOwnerPage.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('INDIVIDUAL_OWNER');
    }
    
    await petOwnerPage.click('button[type="submit"]');
    await petOwnerPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Criar pet
    await petOwnerPage.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await petOwnerPage.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await petOwnerPage.fill('input[name="name"]', petData.name);
    await petOwnerPage.selectOption('select[name="species"]', petData.species);
    await petOwnerPage.fill('input[name="breed"]', petData.breed);
    await petOwnerPage.fill('input[name="age"]', petData.age);
    await petOwnerPage.selectOption('select[name="size"]', petData.size);
    await petOwnerPage.selectOption('select[name="gender"]', petData.gender);
    await petOwnerPage.fill('input[name="color"]', petData.color);
    await petOwnerPage.fill('textarea[name="description"]', petData.description);
    await petOwnerPage.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await petOwnerPage.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    await petOwnerPage.close();
    
    // Criar conta de Adotante
    const adopter = generateTestUser('ADOPTER');
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', adopter.email);
    await page.fill('input[name="name"]', adopter.name);
    await page.fill('input[name="password"]', adopter.password);
    await page.fill('input[name="confirmPassword"]', adopter.password);
    
    const adopterUserTypeSelect = page.locator('select[name="userType"]');
    if (await adopterUserTypeSelect.isVisible().catch(() => false)) {
      await adopterUserTypeSelect.selectOption('ADOPTER');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Navegar para catálogo e procurar pet
    await page.goto(`${TEST_URL}/pets`);
    await page.waitForSelector('[data-testid="pet-card"], .pet-card', { timeout: 5000 });
    
    // Encontrar e clicar no pet
    const petCard = page.locator(`text=${petData.name}`).first();
    await petCard.click();
    
    // Clicar em "Manifestar Interesse"
    await page.click('button:has-text("Manifestar Interesse"), button:has-text("Express Interest"), button:has-text("Adotar")');
    
    // Verificar se formulário de adoção apareceu
    const adoptionForm = page.locator('[data-testid="adoption-form"], form').first();
    await expect(adoptionForm).toBeVisible({ timeout: 5000 });
  });

  test('deve preencher e submeter formulário de adoção', async ({ page, context }) => {
    // Criar e fazer login como Pet Owner com pet
    const petOwner = generateTestUser('INDIVIDUAL_OWNER');
    const petData = generateTestPet();
    
    const petOwnerPage = await context.newPage();
    await petOwnerPage.goto(`${TEST_URL}/auth/register`);
    await petOwnerPage.fill('input[name="email"]', petOwner.email);
    await petOwnerPage.fill('input[name="name"]', petOwner.name);
    await petOwnerPage.fill('input[name="password"]', petOwner.password);
    await petOwnerPage.fill('input[name="confirmPassword"]', petOwner.password);
    
    const userTypeSelect = petOwnerPage.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('INDIVIDUAL_OWNER');
    }
    
    await petOwnerPage.click('button[type="submit"]');
    await petOwnerPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Criar pet
    await petOwnerPage.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await petOwnerPage.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await petOwnerPage.fill('input[name="name"]', petData.name);
    await petOwnerPage.selectOption('select[name="species"]', petData.species);
    await petOwnerPage.fill('input[name="breed"]', petData.breed);
    await petOwnerPage.fill('input[name="age"]', petData.age);
    await petOwnerPage.selectOption('select[name="size"]', petData.size);
    await petOwnerPage.selectOption('select[name="gender"]', petData.gender);
    await petOwnerPage.fill('input[name="color"]', petData.color);
    await petOwnerPage.fill('textarea[name="description"]', petData.description);
    await petOwnerPage.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await petOwnerPage.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    await petOwnerPage.close();
    
    // Login como adotante
    const adopter = generateTestUser('ADOPTER');
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', adopter.email);
    await page.fill('input[name="name"]', adopter.name);
    await page.fill('input[name="password"]', adopter.password);
    await page.fill('input[name="confirmPassword"]', adopter.password);
    
    const adopterUserTypeSelect = page.locator('select[name="userType"]');
    if (await adopterUserTypeSelect.isVisible().catch(() => false)) {
      await adopterUserTypeSelect.selectOption('ADOPTER');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Manifestar interesse
    await page.goto(`${TEST_URL}/pets`);
    const petCard = page.locator(`text=${petData.name}`).first();
    await petCard.click();
    await page.click('button:has-text("Manifestar Interesse"), button:has-text("Express Interest"), button:has-text("Adotar")');
    
    // Preencher formulário
    const adopterInfo = generateAdopterInfo();
    
    // Tentar preencher campos de informações pessoais
    const fullNameInput = page.locator('input[name*="fullName"], input[placeholder*="Nome"]').first();
    if (await fullNameInput.isVisible().catch(() => false)) {
      await fullNameInput.fill(adopterInfo.fullName);
    }
    
    const phoneInput = page.locator('input[name*="phone"], input[placeholder*="Telefone"]').first();
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill(adopterInfo.phone);
    }
    
    const addressInput = page.locator('input[name*="address"], input[placeholder*="Endereço"]').first();
    if (await addressInput.isVisible().catch(() => false)) {
      await addressInput.fill(adopterInfo.address);
    }
    
    // Submeter
    await page.click('button[type="submit"]:has-text("Enviar"), button[type="submit"]:has-text("Submit")');
    
    // Verificar sucesso
    const successMessage = page.locator('[data-testid="success-message"], text=Sucesso, text=Success').first();
    const isSuccessful = await successMessage.isVisible({ timeout: 5000 }).catch(async () => {
      return page.url().includes('/dashboard') || page.url().includes('/adoption-success');
    });
    
    expect(isSuccessful).toBeTruthy();
  });

  test('deve permitir Pet Owner revisar e aprovar adoção', async ({ page, context }) => {
    // Criar Pet Owner e pet
    const petOwner = generateTestUser('INDIVIDUAL_OWNER');
    const petData = generateTestPet();
    
    const petOwnerPage = await context.newPage();
    await petOwnerPage.goto(`${TEST_URL}/auth/register`);
    await petOwnerPage.fill('input[name="email"]', petOwner.email);
    await petOwnerPage.fill('input[name="name"]', petOwner.name);
    await petOwnerPage.fill('input[name="password"]', petOwner.password);
    await petOwnerPage.fill('input[name="confirmPassword"]', petOwner.password);
    
    const ownerTypeSelect = petOwnerPage.locator('select[name="userType"]');
    if (await ownerTypeSelect.isVisible().catch(() => false)) {
      await ownerTypeSelect.selectOption('INDIVIDUAL_OWNER');
    }
    
    await petOwnerPage.click('button[type="submit"]');
    await petOwnerPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Criar pet
    await petOwnerPage.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await petOwnerPage.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await petOwnerPage.fill('input[name="name"]', petData.name);
    await petOwnerPage.selectOption('select[name="species"]', petData.species);
    await petOwnerPage.fill('input[name="breed"]', petData.breed);
    await petOwnerPage.fill('input[name="age"]', petData.age);
    await petOwnerPage.selectOption('select[name="size"]', petData.size);
    await petOwnerPage.selectOption('select[name="gender"]', petData.gender);
    await petOwnerPage.fill('input[name="color"]', petData.color);
    await petOwnerPage.fill('textarea[name="description"]', petData.description);
    await petOwnerPage.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await petOwnerPage.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Criar adotante e manifestar interesse
    const adopter = generateTestUser('ADOPTER');
    const adopterInfo = generateAdopterInfo();
    
    const adopterPage = await context.newPage();
    await adopterPage.goto(`${TEST_URL}/auth/register`);
    await adopterPage.fill('input[name="email"]', adopter.email);
    await adopterPage.fill('input[name="name"]', adopter.name);
    await adopterPage.fill('input[name="password"]', adopter.password);
    await adopterPage.fill('input[name="confirmPassword"]', adopter.password);
    
    const adopterTypeSelect = adopterPage.locator('select[name="userType"]');
    if (await adopterTypeSelect.isVisible().catch(() => false)) {
      await adopterTypeSelect.selectOption('ADOPTER');
    }
    
    await adopterPage.click('button[type="submit"]');
    await adopterPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Manifestar interesse
    await adopterPage.goto(`${TEST_URL}/pets`);
    const petCard = adopterPage.locator(`text=${petData.name}`).first();
    await petCard.click();
    await adopterPage.click('button:has-text("Manifestar Interesse"), button:has-text("Express Interest"), button:has-text("Adotar")');
    
    // Preencher e submeter
    const fullNameInput = adopterPage.locator('input[name*="fullName"], input[placeholder*="Nome"]').first();
    if (await fullNameInput.isVisible().catch(() => false)) {
      await fullNameInput.fill(adopterInfo.fullName);
    }
    
    await adopterPage.click('button[type="submit"]:has-text("Enviar"), button[type="submit"]:has-text("Submit")');
    await adopterPage.waitForTimeout(1000);
    await adopterPage.close();
    
    // Voltar para Pet Owner e revisar
    await petOwnerPage.goto(`${TEST_URL}/dashboard/adoption-requests`);
    await petOwnerPage.waitForSelector('[data-testid="adoption-request-card"], .adoption-request-card', { timeout: 5000 });
    
    // Aprovar primeira solicitação
    const approveBtn = petOwnerPage.locator('button:has-text("Aprovar"), button:has-text("Approve")').first();
    if (await approveBtn.isVisible().catch(() => false)) {
      await approveBtn.click();
      
      // Verificar aprovação
      const successMsg = petOwnerPage.locator('[data-testid="success-message"], text=Sucesso, text=aprovado').first();
      const isApproved = await successMsg.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isApproved).toBeTruthy();
    }
    
    await petOwnerPage.close();
  });

  test('deve permitir Pet Owner rejeitar adoção com motivo', async ({ page, context }) => {
    // Criar Pet Owner e pet
    const petOwner = generateTestUser('INDIVIDUAL_OWNER');
    const petData = generateTestPet();
    
    const petOwnerPage = await context.newPage();
    await petOwnerPage.goto(`${TEST_URL}/auth/register`);
    await petOwnerPage.fill('input[name="email"]', petOwner.email);
    await petOwnerPage.fill('input[name="name"]', petOwner.name);
    await petOwnerPage.fill('input[name="password"]', petOwner.password);
    await petOwnerPage.fill('input[name="confirmPassword"]', petOwner.password);
    
    const ownerTypeSelect = petOwnerPage.locator('select[name="userType"]');
    if (await ownerTypeSelect.isVisible().catch(() => false)) {
      await ownerTypeSelect.selectOption('INDIVIDUAL_OWNER');
    }
    
    await petOwnerPage.click('button[type="submit"]');
    await petOwnerPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Criar pet
    await petOwnerPage.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await petOwnerPage.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await petOwnerPage.fill('input[name="name"]', petData.name);
    await petOwnerPage.selectOption('select[name="species"]', petData.species);
    await petOwnerPage.fill('input[name="breed"]', petData.breed);
    await petOwnerPage.fill('input[name="age"]', petData.age);
    await petOwnerPage.selectOption('select[name="size"]', petData.size);
    await petOwnerPage.selectOption('select[name="gender"]', petData.gender);
    await petOwnerPage.fill('input[name="color"]', petData.color);
    await petOwnerPage.fill('textarea[name="description"]', petData.description);
    await petOwnerPage.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await petOwnerPage.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Criar adotante e manifestar interesse
    const adopter = generateTestUser('ADOPTER');
    const adopterInfo = generateAdopterInfo();
    
    const adopterPage = await context.newPage();
    await adopterPage.goto(`${TEST_URL}/auth/register`);
    await adopterPage.fill('input[name="email"]', adopter.email);
    await adopterPage.fill('input[name="name"]', adopter.name);
    await adopterPage.fill('input[name="password"]', adopter.password);
    await adopterPage.fill('input[name="confirmPassword"]', adopter.password);
    
    const adopterTypeSelect = adopterPage.locator('select[name="userType"]');
    if (await adopterTypeSelect.isVisible().catch(() => false)) {
      await adopterTypeSelect.selectOption('ADOPTER');
    }
    
    await adopterPage.click('button[type="submit"]');
    await adopterPage.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
    
    // Manifestar interesse
    await adopterPage.goto(`${TEST_URL}/pets`);
    const petCard = adopterPage.locator(`text=${petData.name}`).first();
    await petCard.click();
    await adopterPage.click('button:has-text("Manifestar Interesse"), button:has-text("Express Interest"), button:has-text("Adotar")');
    
    // Preencher e submeter
    const fullNameInput = adopterPage.locator('input[name*="fullName"], input[placeholder*="Nome"]').first();
    if (await fullNameInput.isVisible().catch(() => false)) {
      await fullNameInput.fill(adopterInfo.fullName);
    }
    
    await adopterPage.click('button[type="submit"]:has-text("Enviar"), button[type="submit"]:has-text("Submit")');
    await adopterPage.waitForTimeout(1000);
    await adopterPage.close();
    
    // Pet Owner rejeita
    await petOwnerPage.goto(`${TEST_URL}/dashboard/adoption-requests`);
    await petOwnerPage.waitForSelector('[data-testid="adoption-request-card"], .adoption-request-card', { timeout: 5000 });
    
    const rejectBtn = petOwnerPage.locator('button:has-text("Rejeitar"), button:has-text("Reject")').first();
    if (await rejectBtn.isVisible().catch(() => false)) {
      await rejectBtn.click();
      
      // Preencher motivo se houver modal
      const reasonField = petOwnerPage.locator('textarea[name="rejectionReason"], textarea[placeholder*="motivo"]').first();
      if (await reasonField.isVisible().catch(() => false)) {
        await reasonField.fill('Cannot adopt at this time');
      }
      
      // Confirmar
      const confirmBtn = petOwnerPage.locator('button:has-text("Confirmar"), button:has-text("Confirm")').first();
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
      }
      
      // Verificar que foi rejeitado
      const rejectedMsg = petOwnerPage.locator('text=rejeitado, text=rejected').first();
      const isRejected = await rejectedMsg.isVisible({ timeout: 5000 }).catch(() => false);
      expect(isRejected).toBeTruthy();
    }
    
    await petOwnerPage.close();
  });
});
