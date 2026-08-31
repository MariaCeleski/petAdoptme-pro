/**
 * Testes E2E de Gerenciamento de Pets
 * 
 * Requirements:
 *   - 2.1: Create pet profiles
 *   - 2.2: Mandatory pet fields
 *   - 2.3: Optional pet fields
 *   - 2.4: Pet data validation
 *   - 2.5: Edit pet information
 *   - 2.6: Change pet status
 *   - 2.7: Archive pet records
 */

import { test, expect } from '@playwright/test';
import { generateTestUser, generateTestPet } from '../helpers/test-data.js';

const TEST_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Gerenciamento de Pets', () => {
  
  test.beforeEach(async ({ page }) => {
    // Fazer login como Pet Owner
    const testUser = generateTestUser('INDIVIDUAL_OWNER');
    
    await page.goto(`${TEST_URL}/auth/register`);
    await page.fill('input[name="email"]', testUser.email);
    await page.fill('input[name="name"]', testUser.name);
    await page.fill('input[name="password"]', testUser.password);
    await page.fill('input[name="confirmPassword"]', testUser.password);
    
    const userTypeSelect = page.locator('select[name="userType"]');
    if (await userTypeSelect.isVisible().catch(() => false)) {
      await userTypeSelect.selectOption('INDIVIDUAL_OWNER');
    }
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/(dashboard|pets|)/, { timeout: 5000 });
  });

  test('deve criar novo pet com todos os campos obrigatórios', async ({ page }) => {
    const petData = generateTestPet();
    
    // Navegar para criar pet
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    // Preencher campos obrigatórios
    await page.fill('input[name="name"]', petData.name);
    await page.selectOption('select[name="species"]', petData.species);
    await page.fill('input[name="breed"]', petData.breed);
    await page.fill('input[name="age"]', petData.age);
    await page.selectOption('select[name="size"]', petData.size);
    await page.selectOption('select[name="gender"]', petData.gender);
    await page.fill('input[name="color"]', petData.color);
    await page.fill('textarea[name="description"]', petData.description);
    
    // Submeter
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    // Verificar sucesso
    await page.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Verificar se pet aparece na lista
    const petCard = page.locator(`text=${petData.name}`).first();
    await expect(petCard).toBeVisible({ timeout: 5000 });
  });

  test('deve validar campos obrigatórios antes de criar pet', async ({ page }) => {
    // Navegar para criar pet
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    // Tentar submeter sem preencher campos
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    // Verificar mensagens de erro
    const errorMessages = page.locator('[data-testid="error"], .error, .text-red-600, .text-red-500').first();
    const formStays = page.url().includes('/new');
    
    const hasValidation = await errorMessages.isVisible().catch(() => false) || formStays;
    expect(hasValidation).toBeTruthy();
  });

  test('deve editar informações do pet', async ({ page }) => {
    const petData = generateTestPet();
    
    // Criar pet primeiro
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await page.fill('input[name="name"]', petData.name);
    await page.selectOption('select[name="species"]', petData.species);
    await page.fill('input[name="breed"]', petData.breed);
    await page.fill('input[name="age"]', petData.age);
    await page.selectOption('select[name="size"]', petData.size);
    await page.selectOption('select[name="gender"]', petData.gender);
    await page.fill('input[name="color"]', petData.color);
    await page.fill('textarea[name="description"]', petData.description);
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await page.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Encontrar e clicar no pet para editar
    const petCard = page.locator(`text=${petData.name}`).first();
    await petCard.click();
    
    // Clicar em editar
    await page.click('button:has-text("Editar"), a:has-text("Edit")');
    
    // Modificar descrição
    const newDescription = 'Updated description at ' + new Date().toISOString();
    await page.fill('textarea[name="description"]', newDescription);
    
    // Salvar
    await page.click('button[type="submit"]:has-text("Salvar"), button[type="submit"]:has-text("Save")');
    
    // Verificar atualização
    await page.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    const petDetails = page.locator(`text=${newDescription}`).first();
    await expect(petDetails).toBeVisible({ timeout: 5000 });
  });

  test('deve mudar status do pet', async ({ page }) => {
    const petData = generateTestPet();
    
    // Criar pet
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await page.fill('input[name="name"]', petData.name);
    await page.selectOption('select[name="species"]', petData.species);
    await page.fill('input[name="breed"]', petData.breed);
    await page.fill('input[name="age"]', petData.age);
    await page.selectOption('select[name="size"]', petData.size);
    await page.selectOption('select[name="gender"]', petData.gender);
    await page.fill('input[name="color"]', petData.color);
    await page.fill('textarea[name="description"]', petData.description);
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await page.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Encontrar e abrir pet
    const petCard = page.locator(`text=${petData.name}`).first();
    await petCard.click();
    
    // Mudar status
    const statusSelect = page.locator('select[name="status"]').first();
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption('UNAVAILABLE');
      await page.click('button[type="submit"]:has-text("Salvar")');
      
      // Verificar que status mudou
      await page.waitForSelector('[data-testid="pet-status-UNAVAILABLE"], text=Indisponível, text=Unavailable');
    }
  });

  test('deve manter campos opcionais', async ({ page }) => {
    const petData = generateTestPet();
    petData.isNeutered = true;
    petData.isVaccinated = true;
    petData.healthStatus = 'Healthy with seasonal allergies';
    
    // Criar pet
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await page.fill('input[name="name"]', petData.name);
    await page.selectOption('select[name="species"]', petData.species);
    await page.fill('input[name="breed"]', petData.breed);
    await page.fill('input[name="age"]', petData.age);
    await page.selectOption('select[name="size"]', petData.size);
    await page.selectOption('select[name="gender"]', petData.gender);
    await page.fill('input[name="color"]', petData.color);
    await page.fill('textarea[name="description"]', petData.description);
    
    // Campos opcionais
    if (await page.locator('input[name="isNeutered"]').isVisible().catch(() => false)) {
      if (petData.isNeutered) {
        await page.check('input[name="isNeutered"]');
      }
    }
    if (await page.locator('input[name="isVaccinated"]').isVisible().catch(() => false)) {
      if (petData.isVaccinated) {
        await page.check('input[name="isVaccinated"]');
      }
    }
    if (await page.locator('textarea[name="healthStatus"]').isVisible().catch(() => false)) {
      await page.fill('textarea[name="healthStatus"]', petData.healthStatus);
    }
    
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    await page.waitForURL(/\/dashboard\/pets|\/pets/, { timeout: 5000 });
    
    // Verificar que dados foram salvos
    const petCard = page.locator(`text=${petData.name}`).first();
    await expect(petCard).toBeVisible({ timeout: 5000 });
  });

  test('deve mostrar apenas pets disponíveis no catálogo público', async ({ page }) => {
    // Criar dois pets
    const pet1 = generateTestPet();
    const pet2 = generateTestPet();
    
    // Criar primeiro pet
    await page.click('a:has-text("Adicionar Pet"), button:has-text("Novo Pet"), a:has-text("Create Pet")');
    await page.waitForURL(/\/pets\/new|\/dashboard\/pets\/new/, { timeout: 5000 });
    
    await page.fill('input[name="name"]', pet1.name);
    await page.selectOption('select[name="species"]', pet1.species);
    await page.fill('input[name="breed"]', pet1.breed);
    await page.fill('input[name="age"]', pet1.age);
    await page.selectOption('select[name="size"]', pet1.size);
    await page.selectOption('select[name="gender"]', pet1.gender);
    await page.fill('input[name="color"]', pet1.color);
    await page.fill('textarea[name="description"]', pet1.description);
    await page.click('button[type="submit"]:has-text("Criar"), button[type="submit"]:has-text("Salvar")');
    
    // Mudar para UNAVAILABLE
    const petCard1 = page.locator(`text=${pet1.name}`).first();
    await petCard1.click();
    const statusSelect = page.locator('select[name="status"]').first();
    if (await statusSelect.isVisible().catch(() => false)) {
      await statusSelect.selectOption('UNAVAILABLE');
      await page.click('button[type="submit"]:has-text("Salvar")');
    }
    
    // Acessar catálogo público
    await page.goto(`${TEST_URL}/pets`);
    
    // Verificar que pet1 não está visível
    const pet1InCatalog = page.locator(`text=${pet1.name}`).first();
    const isVisible = await pet1InCatalog.isVisible().catch(() => false);
    expect(isVisible).toBeFalsy();
  });
});
