/**
 * Fixtures para teste de pets nos testes E2E
 * 
 * Requirements:
 *   - Testar cadastro e gerenciamento de pets (17.2: 2.1-2.7)
 */

import { test as base } from '@playwright/test';
import path from 'path';

export const petFixture = base.extend({
  /**
   * Fixture que fornece helpers para operações com pets
   */
  petHelper: async ({ page }, use) => {
    const helper = {
      /**
       * Criar um pet via formulário
       * @param {object} petData 
       */
      createPet: async (petData) => {
        await page.goto('/dashboard/pets/new');
        
        // Preencher formulário
        await page.fill('input[name="name"]', petData.name);
        await page.selectOption('select[name="species"]', petData.species || 'DOG');
        await page.fill('input[name="breed"]', petData.breed);
        await page.fill('input[name="age"]', petData.age);
        await page.selectOption('select[name="size"]', petData.size || 'MEDIUM');
        await page.selectOption('select[name="gender"]', petData.gender || 'MALE');
        await page.fill('input[name="color"]', petData.color || 'Brown');
        await page.fill('textarea[name="description"]', petData.description);
        
        // Checkboxes opcionais
        if (petData.isNeutered) {
          await page.check('input[name="isNeutered"]');
        }
        if (petData.isVaccinated) {
          await page.check('input[name="isVaccinated"]');
        }

        // Adicionar imagem se fornecida
        if (petData.imagePath) {
          const fileInput = page.locator('input[type="file"]').first();
          await fileInput.setInputFiles(petData.imagePath);
          // Aguardar upload
          await page.waitForSelector('[data-testid="image-uploaded"]', { timeout: 10000 });
        }

        // Submeter formulário
        await page.click('button:has-text("Criar Pet"), button:has-text("Salvar")');
        await page.waitForURL(/\/dashboard\/pets|\/pets/);
      },

      /**
       * Editar um pet existente
       * @param {string} petName 
       * @param {object} updates 
       */
      editPet: async (petName, updates) => {
        // Encontrar pet na lista
        await page.goto('/dashboard/pets');
        const petCard = page.locator(`text=${petName}`).first();
        await petCard.click();
        
        // Clicar em editar
        await page.click('button:has-text("Editar")');
        
        // Atualizar campos fornecidos
        if (updates.name) {
          await page.fill('input[name="name"]', updates.name);
        }
        if (updates.description) {
          await page.fill('textarea[name="description"]', updates.description);
        }
        if (updates.status) {
          await page.selectOption('select[name="status"]', updates.status);
        }

        // Salvar
        await page.click('button:has-text("Salvar")');
        await page.waitForURL(/\/dashboard\/pets|\/pets/);
      },

      /**
       * Deletar um pet (arquivar)
       * @param {string} petName 
       */
      deletePet: async (petName) => {
        await page.goto('/dashboard/pets');
        const petCard = page.locator(`text=${petName}`).first();
        await petCard.click();
        
        await page.click('button:has-text("Deletar"), button:has-text("Arquivar")');
        
        // Confirmar se há modal de confirmação
        await page.click('button:has-text("Confirmar"), button:has-text("Sim")').catch(() => {});
        
        await page.waitForURL(/\/dashboard\/pets|\/pets/);
      },

      /**
       * Atualizar status do pet
       * @param {string} petName 
       * @param {string} status 
       */
      updatePetStatus: async (petName, status) => {
        await page.goto('/dashboard/pets');
        const petCard = page.locator(`text=${petName}`).first();
        await petCard.click();
        
        await page.selectOption('select[name="status"]', status);
        await page.click('button:has-text("Salvar")');
        await page.waitForSelector(`[data-testid="pet-status-${status}"]`);
      },

      /**
       * Buscar pet no catálogo público
       * @param {string} searchTerm 
       */
      searchPet: async (searchTerm) => {
        await page.goto('/pets');
        await page.fill('input[placeholder*="Buscar"], input[placeholder*="Search"]', searchTerm);
        await page.press('input', 'Enter');
        await page.waitForSelector('[data-testid="pet-card"]', { timeout: 5000 }).catch(() => {});
      },

      /**
       * Filtrar pets por espécie
       * @param {string} species 
       */
      filterBySpecies: async (species) => {
        await page.goto('/pets');
        const speciesFilter = page.locator('select[name="species"], [data-testid="species-filter"]').first();
        await speciesFilter.selectOption(species);
        await page.waitForTimeout(500); // Aguardar filtro aplicar
      },

      /**
       * Filtrar pets por tamanho
       * @param {string} size 
       */
      filterBySize: async (size) => {
        await page.goto('/pets');
        const sizeFilter = page.locator('select[name="size"], [data-testid="size-filter"]').first();
        await sizeFilter.selectOption(size);
        await page.waitForTimeout(500);
      },

      /**
       * Obter lista de pets visíveis
       */
      getPetsVisible: async () => {
        const petCards = page.locator('[data-testid="pet-card"], .pet-card').all();
        const pets = [];
        for (const card of await petCards) {
          const nameElement = card.locator('[data-testid="pet-name"], .pet-name').first();
          const name = await nameElement.textContent();
          if (name) {
            pets.push({ name: name.trim(), element: card });
          }
        }
        return pets;
      },

      /**
       * Clicar em um pet para ver detalhes
       * @param {string} petName 
       */
      viewPetDetails: async (petName) => {
        await page.goto('/pets');
        const petCard = page.locator(`text=${petName}`).first();
        await petCard.click();
        await page.waitForURL(/\/pets\/[a-zA-Z0-9]+/);
      },

      /**
       * Criar pet de teste com dados aleatórios
       */
      createTestPet: async () => {
        const timestamp = Date.now();
        const testPet = {
          name: `Test Pet ${timestamp}`,
          species: 'DOG',
          breed: 'Labrador',
          age: '2',
          size: 'LARGE',
          gender: 'MALE',
          color: 'Golden',
          description: `Test pet created at ${new Date().toISOString()}`,
          isNeutered: true,
          isVaccinated: true
        };

        await helper.createPet(testPet);
        return testPet;
      },
    };

    await use(helper);
  },

  /**
   * Fixture que fornece um pet de teste criado
   */
  testPetCreated: async ({ page, petHelper }, use) => {
    const testPet = await petHelper.createTestPet();
    await use(testPet);
  },
});

export { expect } from '@playwright/test';
