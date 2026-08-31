# PetAdopt Design System - UI Components

Este é o design system fundamental da plataforma PetAdopt, implementando componentes reutilizáveis, acessíveis e responsivos seguindo as diretrizes de design especificadas no projeto.

## 🎨 Componentes Implementados

### Button
Componente de botão extensível com múltiplas variantes, tamanhos e estados.

**Funcionalidades:**
- ✅ Variantes: primary, secondary, success, outline, ghost, danger
- ✅ Tamanhos: small, medium, large
- ✅ Estados: disabled, loading, hover, focus
- ✅ Suporte a ícones (esquerda/direita)
- ✅ Modo circular (rounded)
- ✅ Botões icon-only
- ✅ Renderização como link (`as="link"`)
- ✅ Acessibilidade completa (ARIA, navegação por teclado)

**Exemplo de uso:**
```jsx
import { Button } from '@/components/ui';

<Button variant="primary" size="medium" loading>
  Carregando...
</Button>

<Button variant="outline" icon={<SearchIcon />} iconPosition="left">
  Buscar
</Button>
```

### Input
Campo de entrada versátil com validação e suporte a ícones.

**Funcionalidades:**
- ✅ Variantes: default, success, warning, error
- ✅ Tamanhos: small, medium, large
- ✅ Suporte a ícones (esquerda/direita)
- ✅ Labels, placeholders, textos de ajuda
- ✅ Validação visual com mensagens de erro
- ✅ Estados disabled e required
- ✅ Acessibilidade (ARIA labels, descrições)

**Exemplo de uso:**
```jsx
import { Input } from '@/components/ui';

<Input
  label="Nome do Pet"
  placeholder="Digite o nome"
  error="Nome é obrigatório"
  icon={<PetIcon />}
  required
/>
```

### Select
Select customizado com busca, multi-seleção e acessibilidade.

**Funcionalidades:**
- ✅ Dropdown customizado com animações
- ✅ Busca em tempo real (searchable)
- ✅ Multi-seleção com checkboxes
- ✅ Navegação por teclado (Arrow keys, Enter, Escape)
- ✅ Suporte a opções com descrição
- ✅ Estados disabled para opções individuais
- ✅ Acessibilidade completa (ARIA roles, combobox)

**Exemplo de uso:**
```jsx
import { Select } from '@/components/ui';

const options = [
  { value: 'dog', label: 'Cachorro', description: 'Cães domésticos' },
  { value: 'cat', label: 'Gato', description: 'Felinos domésticos' }
];

<Select
  label="Espécie"
  options={options}
  searchable
  multiple
  placeholder="Selecione as espécies"
/>
```

### Modal
Modal completo com gerenciamento de foco e múltiplos tamanhos.

**Funcionalidades:**
- ✅ Gerenciamento automático de foco (focus trap)
- ✅ Fechamento com Escape e click no overlay
- ✅ Prevenção de scroll do body
- ✅ Tamanhos: small, medium, large, fullscreen
- ✅ Portal para renderização no body
- ✅ Animações de entrada/saída
- ✅ Acessibilidade (ARIA modal, dialog)

**Exemplo de uso:**
```jsx
import { Modal } from '@/components/ui';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Adoção"
  size="medium"
>
  <p>Tem certeza que deseja adotar este pet?</p>
</Modal>
```

### Card
Sistema de cards composáveis com sub-componentes.

**Funcionalidades:**
- ✅ Variantes: default, outlined, elevated, filled, gradient
- ✅ Tamanhos e espaçamentos customizáveis
- ✅ Efeitos hover e estados clickable
- ✅ Sub-componentes: Header, Body, Footer, Image, Title, Description, Actions
- ✅ Suporte a layouts horizontais
- ✅ Estados de loading com shimmer

**Exemplo de uso:**
```jsx
import { Card } from '@/components/ui';

<Card hover clickable onClick={handleClick}>
  <Card.Image src="/pet-image.jpg" alt="Pet" />
  <Card.Body>
    <Card.Title>Rex</Card.Title>
    <Card.Description>
      Cãozinho brincalhão procurando um lar.
    </Card.Description>
  </Card.Body>
  <Card.Footer>
    <Card.Actions align="between">
      <Button variant="primary">Adotar</Button>
      <Button variant="outline">Ver mais</Button>
    </Card.Actions>
  </Card.Footer>
</Card>
```

### Badge
Sistema de badges com variantes especializadas.

**Funcionalidades:**
- ✅ Variantes base: default, primary, success, warning, danger, info
- ✅ Variantes outline e soft
- ✅ Tamanhos: small, medium, large
- ✅ Badges dot para indicadores
- ✅ Badges removíveis com callback
- ✅ Sub-componentes especializados: Status, Pet, Counter
- ✅ Suporte a ícones

**Exemplo de uso:**
```jsx
import { Badge } from '@/components/ui';

<Badge variant="success">Disponível</Badge>
<Badge.Status status="adopted">Adotado</Badge.Status>
<Badge.Pet type="neutered" />
<Badge.Counter count={5} />
```

### Avatar
Componente de avatar com fallbacks e grupos.

**Funcionalidades:**
- ✅ Tamanhos: small, medium, large, xl, xxl
- ✅ Variantes: circular, rounded, square
- ✅ Fallback para iniciais coloridas
- ✅ Indicadores de status (online, offline, away, busy)
- ✅ Carregamento progressivo de imagens
- ✅ Avatar.Group para múltiplos avatars
- ✅ Estados clickable com hover

**Exemplo de uso:**
```jsx
import { Avatar } from '@/components/ui';

<Avatar
  src="/user-photo.jpg"
  name="João Silva"
  size="large"
  status="online"
  onClick={handleClick}
/>

<Avatar.Group max={3}>
  <Avatar name="João" />
  <Avatar name="Maria" />
  <Avatar name="Pedro" />
</Avatar.Group>
```

### LoadingSkeleton
Sistema de esqueletos de carregamento personalizáveis.

**Funcionalidades:**
- ✅ Variantes base: text, circle, image, button, input
- ✅ Animação shimmer customizável
- ✅ Templates pré-configurados: Card, Avatar, List, Table, Form
- ✅ Suporte a múltiplas linhas de texto
- ✅ Larguras e alturas customizáveis

**Exemplo de uso:**
```jsx
import { LoadingSkeleton } from '@/components/ui';

<LoadingSkeleton variant="text" lines={3} />
<LoadingSkeleton.Card showImage showActions />
<LoadingSkeleton.List items={5} showAvatar />
```

### ErrorBoundary
Sistema robusto de tratamento de erros React.

**Funcionalidades:**
- ✅ Captura de erros com stack trace
- ✅ Logging automático para serviços de monitoramento
- ✅ UI de fallback customizável
- ✅ Botões de retry e reload
- ✅ HOC e hook para componentes funcionais
- ✅ Variantes especializadas: Page, Component, Async
- ✅ Modo de desenvolvimento com detalhes técnicos

**Exemplo de uso:**
```jsx
import { ErrorBoundary, withErrorBoundary } from '@/components/ui';

<ErrorBoundary
  title="Erro na página"
  message="Não foi possível carregar o conteúdo"
  onError={(error, errorInfo) => logToService(error)}
>
  <MyComponent />
</ErrorBoundary>

// Como HOC
const SafeComponent = withErrorBoundary(MyComponent, {
  title: "Erro no componente"
});
```

## 🎨 Design Tokens

Todos os componentes utilizam o sistema de design tokens definido em `globals.css`:

### Cores
```css
--primary-orange: #FF8C42;
--primary-blue: #4A90E2;
--primary-green: #2ECC71;
--neutral-dark: #2C3E50;
--neutral-white: #FFFFFF;
```

### Espaçamentos
```css
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
```

### Tipografia
```css
--font-family-primary: var(--font-poppins);
--font-family-secondary: var(--font-inter);
--text-sm: 0.875rem;
--text-base: 1rem;
--text-lg: 1.125rem;
```

### Bordas e Sombras
```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
```

## ♿ Acessibilidade

Todos os componentes seguem as diretrizes WCAG 2.1 AA:

- ✅ Navegação por teclado completa
- ✅ ARIA labels e roles apropriados
- ✅ Contraste de cores adequado
- ✅ Focus management em modais
- ✅ Screen reader compatibility
- ✅ Suporte a modo de alto contraste
- ✅ Reduced motion support

## 📱 Responsividade

Breakpoints definidos:
- **Mobile**: até 640px
- **Tablet**: 641px - 1023px
- **Desktop**: 1024px+

Todos os componentes se adaptam automaticamente a diferentes tamanhos de tela.

## 🧪 Testes

Para testar os componentes, acesse `/test-components` no navegador durante o desenvolvimento.

## 📝 Próximos Passos

1. **Testes automatizados**: Implementar testes unitários e de acessibilidade
2. **Storybook**: Documentação interativa dos componentes
3. **Componentes adicionais**: Implementar componentes específicos como PetCard, AdoptionForm
4. **Theming**: Sistema de temas dinâmicos (claro/escuro)

---

**Desenvolvido para PetAdopt Platform v1.0**
*Seguindo as especificações do Task 4.1 - Implementar componentes UI fundamentais*