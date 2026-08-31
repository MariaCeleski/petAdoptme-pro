/**
 * Fixtures consolidadas para testes E2E da PetAdopt Platform
 * 
 * Combina todas as fixtures (autenticação, pets, adoção) em um único export
 */

import { test } from '@playwright/test';
import { authFixture } from './auth.fixture.js';
import { petFixture } from './pet.fixture.js';
import { adoptionFixture } from './adoption.fixture.js';

// Combinar todas as fixtures
export const e2eTest = test
  .extend(authFixture.extend)
  .extend(petFixture.extend)
  .extend(adoptionFixture.extend);

export { expect } from '@playwright/test';
