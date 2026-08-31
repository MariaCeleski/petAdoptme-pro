/**
 * Fixtures para teste de adoção nos testes E2E
 * 
 * Requirements:
 *   - Testar fluxo completo de adoção (17.2: 6.1-6.8)
 */

import { test as base } from '@playwright/test';

export const adoptionFixture = base.extend({
  /**
   * Fixture que fornece helpers para operações de adoção
   */
  adoptionHelper: async ({ page }, use) => {
    const helper = {
      /**
       * Manifestar interesse em um pet
       * @param {string} petName 
       */
      expressInterest: async (petName) => {
        // Encontrar pet e clicar em "Manifestar Interesse"
        const petCard = page.locator(`text=${petName}`).first();
        await petCard.click();
        
        // Clicar no botão de interesse
        await page.click('button:has-text("Manifestar Interesse"), button:has-text("Express Interest"), button:has-text("Adotar")');
        
        // Aguardar modal de formulário de adoção
        await page.waitForSelector('[data-testid="adoption-form"], form[name="adoptionForm"]', { timeout: 5000 });
      },

      /**
       * Preencher formulário de adoção
       * @param {object} adopterInfo 
       */
      fillAdoptionForm: async (adopterInfo) => {
        const info = adopterInfo || {};

        // Informações pessoais
        if (info.fullName) {
          await page.fill('input[name="personalInfo.fullName"], input[name="fullName"], input[placeholder*="Nome"]', info.fullName);
        }
        if (info.phone) {
          await page.fill('input[name="personalInfo.phone"], input[name="phone"], input[placeholder*="Telefone"]', info.phone);
        }
        if (info.email) {
          await page.fill('input[name="personalInfo.email"], input[name="email"]', info.email);
        }
        if (info.address) {
          await page.fill('input[name="personalInfo.address"], input[name="address"], input[placeholder*="Endereço"]', info.address);
        }
        if (info.city) {
          await page.fill('input[name="personalInfo.city"], input[name="city"], input[placeholder*="Cidade"]', info.city);
        }
        if (info.state) {
          await page.fill('input[name="personalInfo.state"], input[name="state"]', info.state);
        }
        if (info.zipCode) {
          await page.fill('input[name="personalInfo.zipCode"], input[name="zipCode"]', info.zipCode);
        }

        // Situação de moradia
        if (info.housingType) {
          await page.selectOption('select[name="livingSituation.housingType"], select[name="housingType"]', info.housingType);
        }
        if (info.hasYard !== undefined) {
          const yardCheckbox = page.locator('input[name="livingSituation.hasYard"], input[name="hasYard"]').first();
          if (info.hasYard && !await yardCheckbox.isChecked()) {
            await yardCheckbox.check();
          }
        }
        if (info.ownRent) {
          await page.selectOption('select[name="livingSituation.ownRent"], select[name="ownRent"]', info.ownRent);
        }

        // Experiência
        if (info.hadPetsBefore !== undefined) {
          const petsCheckbox = page.locator('input[name="experience.hadPetsBefore"], input[name="hadPetsBefore"]').first();
          if (info.hadPetsBefore && !await petsCheckbox.isChecked()) {
            await petsCheckbox.check();
          }
        }

        // Motivação
        if (info.whyAdopt) {
          await page.fill('textarea[name="motivation.whyAdopt"], textarea[name="whyAdopt"], textarea[placeholder*="Por que"]', info.whyAdopt);
        }
        if (info.expectedCommitment) {
          await page.fill('textarea[name="motivation.expectedCommitment"], textarea[name="expectedCommitment"]', info.expectedCommitment);
        }
        if (info.availableTime) {
          await page.fill('textarea[name="motivation.availableTime"], textarea[name="availableTime"]', info.availableTime);
        }
      },

      /**
       * Submeter formulário de adoção
       */
      submitAdoptionForm: async () => {
        await page.click('button[type="submit"]:has-text("Enviar"), button[type="submit"]:has-text("Submit")');
        await page.waitForURL(/\/dashboard|\/adoption-success/, { timeout: 5000 }).catch(() => {});
      },

      /**
       * Manifestar interesse e preencher formulário de adoção
       * @param {string} petName 
       * @param {object} adopterInfo 
       */
      adoptPet: async (petName, adopterInfo) => {
        await helper.expressInterest(petName);
        await helper.fillAdoptionForm(adopterInfo);
        await helper.submitAdoptionForm();
      },

      /**
       * Revisar solicitação de adoção (como pet owner)
       */
      reviewAdoptionRequests: async () => {
        await page.goto('/dashboard/adoption-requests');
        await page.waitForSelector('[data-testid="adoption-request-card"], .adoption-request-card', { timeout: 5000 });
      },

      /**
       * Aprovar solicitação de adoção
       * @param {number} index 
       */
      approveAdoptionRequest: async (index = 0) => {
        const requests = page.locator('[data-testid="adoption-request-card"], .adoption-request-card');
        const request = requests.nth(index);
        const approveBtn = request.locator('button:has-text("Aprovar"), button:has-text("Approve")');
        await approveBtn.click();
        await page.waitForTimeout(500);
      },

      /**
       * Rejeitar solicitação de adoção
       * @param {number} index 
       * @param {string} reason 
       */
      rejectAdoptionRequest: async (index = 0, reason = '') => {
        const requests = page.locator('[data-testid="adoption-request-card"], .adoption-request-card');
        const request = requests.nth(index);
        const rejectBtn = request.locator('button:has-text("Rejeitar"), button:has-text("Reject")');
        await rejectBtn.click();

        // Se há campo de motivo, preencher
        const reasonField = page.locator('textarea[name="rejectionReason"], textarea[placeholder*="motivo"]');
        if (await reasonField.isVisible().catch(() => false)) {
          await reasonField.fill(reason);
        }

        // Confirmar
        await page.click('button:has-text("Confirmar"), button:has-text("Confirm")');
        await page.waitForTimeout(500);
      },

      /**
       * Obter status da solicitação de adoção
       * @param {number} index 
       */
      getAdoptionRequestStatus: async (index = 0) => {
        const requests = page.locator('[data-testid="adoption-request-card"], .adoption-request-card');
        const request = requests.nth(index);
        const statusElement = request.locator('[data-testid="status"], .status');
        return await statusElement.textContent();
      },

      /**
       * Verificar se adoção foi completada
       * @param {string} petName 
       */
      verifyAdoptionCompleted: async (petName) => {
        await page.goto('/dashboard');
        const adoptedPet = page.locator(`text=${petName}`);
        const statusBadge = adoptedPet.locator('[data-testid="status-badge"], .status-badge');
        const status = await statusBadge.textContent();
        return status.toLowerCase().includes('adotado');
      },
    };

    await use(helper);
  },
});

export { expect } from '@playwright/test';
