/**
 * Helpers para testes de acessibilidade
 * 
 * Requirements:
 *   - Testar navegação touch-friendly e responsividade (17.3: 9.1, 9.2, 9.5)
 */

/**
 * Verificar se elemento é acessível por teclado
 * @param {Page} page 
 * @param {string} selector 
 */
export async function isKeyboardAccessible(page, selector) {
  const element = page.locator(selector).first();
  
  // Verificar se elemento ou sua label está visível
  if (!await element.isVisible().catch(() => false)) {
    return false;
  }

  // Verificar se é interativo
  const role = await element.getAttribute('role');
  const ariaLabel = await element.getAttribute('aria-label');
  const tabindex = await element.getAttribute('tabindex');
  
  // Elementos interativos comuns
  const isInteractive = ['button', 'input', 'select', 'textarea', 'a', 'details'].includes(
    await element.evaluate((el) => el.tagName.toLowerCase())
  );

  return (ariaLabel || role || tabindex !== null || isInteractive);
}

/**
 * Navegar usando apenas teclado
 * @param {Page} page 
 * @param {string} direction - 'forward' ou 'backward'
 * @param {number} times 
 */
export async function navigateWithKeyboard(page, direction = 'forward', times = 1) {
  for (let i = 0; i < times; i++) {
    if (direction === 'forward') {
      await page.press('body', 'Tab');
    } else {
      await page.press('body', 'Shift+Tab');
    }
    await page.waitForTimeout(100);
  }
}

/**
 * Verificar se focusable elements estão no order correto
 * @param {Page} page 
 */
export async function getFocusOrder(page) {
  const focusableElements = page.locator(
    'button, input, select, textarea, a[href], [role="button"], [role="link"], [tabindex]:not([tabindex="-1"])'
  );
  
  const elements = [];
  const count = await focusableElements.count();
  
  for (let i = 0; i < count; i++) {
    const element = focusableElements.nth(i);
    const text = await element.textContent();
    const visible = await element.isVisible();
    if (visible) {
      elements.push({
        index: i,
        text: text.trim().substring(0, 50),
        selector: await element.getAttribute('data-testid') || 'no-testid'
      });
    }
  }
  
  return elements;
}

/**
 * Testar contraste de cores
 * @param {Page} page 
 * @param {string} selector 
 */
export async function checkColorContrast(page, selector) {
  const result = await page.evaluate(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      const style = window.getComputedStyle(element);
      const bgColor = style.backgroundColor;
      const color = style.color;
      
      return { bgColor, color };
    },
    selector
  );
  
  return result;
}

/**
 * Verificar se headings têm hierarquia correta
 * @param {Page} page 
 */
export async function checkHeadingHierarchy(page) {
  const headings = await page.evaluate(() => {
    const headingElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const headings = [];
    
    headingElements.forEach((heading) => {
      const level = parseInt(heading.tagName[1]);
      headings.push({
        level,
        text: heading.textContent.trim().substring(0, 50)
      });
    });
    
    return headings;
  });
  
  // Verificar hierarquia (não pular níveis)
  const issues = [];
  let previousLevel = 0;
  
  headings.forEach((heading, index) => {
    if (heading.level > previousLevel + 1) {
      issues.push(`Heading hierarchy issue: jumped from H${previousLevel} to H${heading.level}`);
    }
    previousLevel = heading.level;
  });
  
  return { headings, issues };
}

/**
 * Verificar se imagens têm alt text
 * @param {Page} page 
 */
export async function checkImageAltText(page) {
  const images = await page.evaluate(() => {
    const imgs = document.querySelectorAll('img');
    const results = [];
    
    imgs.forEach((img) => {
      const visible = img.offsetWidth > 0 && img.offsetHeight > 0;
      results.push({
        src: img.src.substring(0, 50),
        alt: img.alt || 'MISSING',
        visible,
        ariaLabel: img.getAttribute('aria-label')
      });
    });
    
    return results;
  });
  
  const missing = images.filter(img => img.visible && !img.alt && !img.ariaLabel);
  
  return { images, missing };
}

/**
 * Verificar se labels estão associadas com inputs
 * @param {Page} page 
 */
export async function checkFormLabels(page) {
  const inputs = await page.evaluate(() => {
    const results = [];
    const formInputs = document.querySelectorAll('input, select, textarea');
    
    formInputs.forEach((input) => {
      const id = input.id;
      const ariaLabel = input.getAttribute('aria-label');
      const label = id ? document.querySelector(`label[for="${id}"]`) : null;
      
      results.push({
        type: input.type || input.tagName,
        hasLabel: !!label,
        hasAriaLabel: !!ariaLabel,
        name: input.name || 'unnamed'
      });
    });
    
    return results;
  });
  
  const missing = inputs.filter(input => !input.hasLabel && !input.hasAriaLabel);
  
  return { inputs, missing };
}

/**
 * Testar responsividade em diferentes viewports
 * @param {Page} page 
 * @returns {object}
 */
export function getResponsiveViewports() {
  return {
    mobile: { width: 375, height: 667, name: 'iPhone SE' },
    mobileLarge: { width: 414, height: 896, name: 'iPhone 11' },
    tablet: { width: 768, height: 1024, name: 'iPad' },
    desktop: { width: 1920, height: 1080, name: 'Desktop' },
    desktopLarge: { width: 2560, height: 1440, name: 'Large Desktop' },
  };
}

/**
 * Verificar se menu é touch-friendly (elementos >= 44x44 pixels)
 * @param {Page} page 
 * @param {string} selector 
 */
export async function isTouchFriendly(page, selector) {
  const size = await page.evaluate(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return null;
      
      const rect = element.getBoundingClientRect();
      return {
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        isTouchFriendly: rect.width >= 44 && rect.height >= 44
      };
    },
    selector
  );
  
  return size;
}

/**
 * Verificar layout não tem horizontal scroll
 * @param {Page} page 
 */
export async function hasNoHorizontalScroll(page) {
  const hasScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  
  return !hasScroll;
}

/**
 * Verificar se viewport está totalmente visível
 * @param {Page} page 
 * @param {string} selector 
 */
export async function isFullyInViewport(page, selector) {
  const isInViewport = await page.evaluate(
    (sel) => {
      const element = document.querySelector(sel);
      if (!element) return false;
      
      const rect = element.getBoundingClientRect();
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= window.innerHeight &&
        rect.right <= window.innerWidth
      );
    },
    selector
  );
  
  return isInViewport;
}
