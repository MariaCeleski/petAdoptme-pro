/**
 * Dados de teste e utilities para geração de dados E2E
 * 
 * Requirements:
 *   - Fornecer dados de teste consistentes para todos os testes E2E
 */

/**
 * Gerar email único para teste
 * @param {string} prefix 
 * @returns {string}
 */
export function generateTestEmail(prefix = 'test') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}-${timestamp}-${random}@test.example.com`;
}

/**
 * Gerar usuário de teste completo
 * @param {string} userType 
 * @returns {object}
 */
export function generateTestUser(userType = 'ADOPTER') {
  const email = generateTestEmail(userType.toLowerCase());
  return {
    email,
    name: `Test User ${Date.now()}`,
    password: 'TestPassword123!',
    confirmPassword: 'TestPassword123!',
    userType,
  };
}

/**
 * Gerar pet de teste
 * @returns {object}
 */
export function generateTestPet() {
  const timestamp = Date.now();
  const species = ['DOG', 'CAT'];
  const sizes = ['SMALL', 'MEDIUM', 'LARGE'];
  const genders = ['MALE', 'FEMALE'];
  const breeds = {
    DOG: ['Labrador', 'Golden Retriever', 'Poodle', 'Husky', 'Bulldog'],
    CAT: ['Siamese', 'Persian', 'Maine Coon', 'Bengal', 'Ragdoll']
  };

  const selectedSpecies = species[Math.floor(Math.random() * species.length)];
  
  return {
    name: `Test Pet ${timestamp}`,
    species: selectedSpecies,
    breed: breeds[selectedSpecies][Math.floor(Math.random() * breeds[selectedSpecies].length)],
    age: Math.floor(Math.random() * 10 + 1).toString(),
    size: sizes[Math.floor(Math.random() * sizes.length)],
    gender: genders[Math.floor(Math.random() * genders.length)],
    color: ['Brown', 'Black', 'White', 'Golden', 'Gray'][Math.floor(Math.random() * 5)],
    description: `Test pet created at ${new Date().toISOString()} for E2E testing`,
    isNeutered: Math.random() > 0.5,
    isVaccinated: Math.random() > 0.3,
  };
}

/**
 * Gerar informações de adotante para formulário de adoção
 * @returns {object}
 */
export function generateAdopterInfo() {
  const timestamp = Date.now();
  return {
    fullName: `Adopter Test ${timestamp}`,
    phone: '11999999999',
    email: generateTestEmail('adopter'),
    address: 'Rua Teste 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01310100',
    housingType: 'house',
    hasYard: true,
    ownRent: 'own',
    hadPetsBefore: true,
    whyAdopt: 'I want to provide a loving home for a pet in need',
    expectedCommitment: 'Committed for the lifetime of the pet',
    availableTime: 'More than 4 hours per day',
  };
}

/**
 * Gerar informações de abrigo
 * @returns {object}
 */
export function generateShelterInfo() {
  const timestamp = Date.now();
  return {
    name: `Test Shelter ${timestamp}`,
    address: 'Avenida Teste 456',
    city: 'Rio de Janeiro',
    state: 'RJ',
    zipCode: '20040020',
    phone: '21988888888',
    email: generateTestEmail('shelter'),
    website: 'https://testshelter.example.com',
    description: 'A test shelter for E2E testing',
  };
}

/**
 * Dados padrão para testes
 */
export const TEST_DATA = {
  // Usuários de teste padrão
  ADOPTER: generateTestUser('ADOPTER'),
  PET_OWNER: generateTestUser('INDIVIDUAL_OWNER'),
  SHELTER_ADMIN: generateTestUser('SHELTER_ADMIN'),
  
  // Pets de teste
  DOGS: [
    { name: 'Max', breed: 'Labrador', species: 'DOG', size: 'LARGE' },
    { name: 'Buddy', breed: 'Golden Retriever', species: 'DOG', size: 'LARGE' },
    { name: 'Charlie', breed: 'Poodle', species: 'DOG', size: 'SMALL' },
  ],
  
  CATS: [
    { name: 'Luna', breed: 'Siamese', species: 'CAT', size: 'SMALL' },
    { name: 'Whiskers', breed: 'Persian', species: 'CAT', size: 'SMALL' },
    { name: 'Leo', breed: 'Bengal', species: 'CAT', size: 'MEDIUM' },
  ],
  
  // Credenciais de teste (se existirem usuários pré-criados)
  DEMO_USER: {
    email: 'demo@example.com',
    password: 'DemoPassword123!',
  },
};

/**
 * Esperar por elemento de forma segura
 * @param {Page} page 
 * @param {string} selector 
 * @param {number} timeout 
 * @returns {Promise<void>}
 */
export async function waitForElement(page, selector, timeout = 5000) {
  try {
    await page.waitForSelector(selector, { timeout });
  } catch (error) {
    console.log(`Element ${selector} not found within ${timeout}ms`);
  }
}

/**
 * Fechar modais ou popups
 * @param {Page} page 
 */
export async function closeModals(page) {
  const closeButtons = page.locator('button:has-text("Fechar"), button:has-text("Close"), button:has-text("×"), button[aria-label*="Close"]');
  const count = await closeButtons.count();
  for (let i = 0; i < count; i++) {
    await closeButtons.first().click().catch(() => {});
  }
}

/**
 * Verificar se página contém texto
 * @param {Page} page 
 * @param {string} text 
 * @returns {Promise<boolean>}
 */
export async function pageContainsText(page, text) {
  try {
    await page.locator(`text=${text}`).first().waitFor({ timeout: 1000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Tirar screenshot para debug
 * @param {Page} page 
 * @param {string} name 
 */
export async function takeScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ path: `test-results/screenshots/${name}-${timestamp}.png` });
}

/**
 * Aguardar elemento estar visível e estável
 * @param {Page} page 
 * @param {string} selector 
 */
export async function waitForElementStable(page, selector) {
  await page.locator(selector).first().waitFor({ state: 'visible', timeout: 5000 });
  await page.waitForTimeout(300); // Aguardar animações
}
