# Implementation Plan: PetAdopt Platform

## Overview

Este plano de implementação converte o design técnico da plataforma PetAdopt em uma série estruturada de tarefas de codificação. A implementação utiliza Next.js 16.x com React 19.x, JavaScript ES2024, e segue uma abordagem incremental que constrói funcionalidades core primeiro, seguida por features avançadas e testes abrangentes.

A arquitetura se baseia no App Router do Next.js com Server Components, API Routes, Prisma ORM, NextAuth.js para autenticação, e integração com serviços externos (Cloudinary, SendGrid/Resend).

## Tasks

- [x] 1. Setup do projeto e configuração base
  - Configurar estrutura inicial do projeto Next.js 16.x
  - Instalar e configurar dependências core (Prisma, NextAuth.js, Cloudinary)
  - Configurar variáveis de ambiente e arquivos de configuração
  - Criar estrutura de diretórios padrão seguindo convenções do App Router
  - _Requirements: Sistema base para todas as funcionalidades_

- [x] 2. Configuração do banco de dados e modelos
  - [x] 2.1 Criar schema Prisma completo
    - Definir models User, Pet, Adoption, Shelter, Account, Session
    - Configurar enums (UserType, Species, Size, Gender, PetStatus, AdoptionStatus)
    - Implementar relacionamentos e constraints
    - Adicionar índices otimizados para performance
    - _Requirements: 2.1, 2.2, 6.1, 11.1_

  - [ ]* 2.2 Escrever teste de propriedade para validação de esquema
    - **Property 2: Pet Mandatory Fields Validation**
    - **Validates: Requirements 2.2**

  - [x] 2.3 Configurar conexão do banco e migrations
    - Configurar Prisma Client com pooling de conexões
    - Executar migrations iniciais
    - Criar seeds para desenvolvimento
    - _Requirements: 2.1, 12.3_

  - [ ]* 2.4 Escrever testes unitários para models
    - Testar relacionamentos entre modelos
    - Testar constraints de integridade referencial
    - _Requirements: 2.1, 2.7_

- [x] 3. Sistema de autenticação base
  - [x] 3.1 Configurar NextAuth.js com providers
    - Implementar CredentialsProvider com validação de senha
    - Configurar GoogleProvider para OAuth
    - Configurar PrismaAdapter para sessões
    - Implementar callbacks personalizados
    - _Requirements: 1.1, 1.2, 1.6_

  - [ ]* 3.2 Escrever teste de propriedade para validação de senha
    - **Property 1: Password Strength Validation**
    - **Validates: Requirements 1.4**

  - [x] 3.3 Criar páginas de autenticação
    - Implementar página de login com form validation
    - Implementar página de registro com verificação de email
    - Criar componentes LoginForm e RegisterForm
    - Implementar reset de senha
    - _Requirements: 1.1, 1.3, 1.5, 1.7_

  - [ ]* 3.4 Escrever testes unitários para fluxos de auth
    - Testar login com credenciais válidas/inválidas
    - Testar registro de usuário e verificação de email
    - Testar OAuth com Google
    - _Requirements: 1.1, 1.2, 1.5_

- [x] 4. Componentes base do design system
  - [x] 4.1 Implementar componentes UI fundamentais
    - Estender componentes Button e Input existentes
    - Criar componentes Select, Modal, Card, Badge, Avatar
    - Implementar LoadingSkeleton e ErrorBoundary
    - Configurar CSS Modules com design tokens
    - _Requirements: 9.1, 9.2, 9.4, 9.6_

  - [x] 4.2 Criar componentes de layout
    - Implementar Layout principal com Header/Footer existentes
    - Criar componente Navigation responsivo
    - Implementar Sidebar para mobile
    - _Requirements: 9.2, 9.5_

  - [ ]* 4.3 Escrever testes de acessibilidade
    - Testar componentes com axe-core
    - Verificar navegação por teclado
    - Testar screen readers
    - _Requirements: 9.6_

- [x] 5. Checkpoint - Sistema base funcional
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Sistema de upload de imagens
  - [x] 6.1 Implementar serviço Cloudinary
    - Configurar upload com otimização automática
    - Implementar geração de thumbnails e avatars
    - Criar utility functions para upload e delete
    - Implementar validação de formato e tamanho
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ]* 6.2 Escrever teste de propriedade para validação de formato
    - **Property 4: Image Format Validation**
    - **Validates: Requirements 3.2**

  - [ ]* 6.3 Escrever teste de propriedade para validação de tamanho
    - **Property 5: Image Size Validation**
    - **Validates: Requirements 3.3**

  - [x] 6.4 Criar API route para upload
    - Implementar /api/upload com validação
    - Configurar rate limiting para uploads
    - Implementar error handling robusto
    - _Requirements: 3.1, 3.4, 12.2_

  - [ ]* 6.5 Escrever testes unitários para upload
    - Testar upload com arquivos válidos/inválidos
    - Testar rate limiting
    - Testar error scenarios
    - _Requirements: 3.2, 3.3, 3.7_

- [x] 7. CRUD de pets e validação
  - [x] 7.1 Implementar schemas de validação Zod
    - Criar petSchema com todas as validações
    - Implementar adoptionSchema com validação de formulário
    - Criar utility functions para sanitização
    - _Requirements: 2.2, 2.4, 12.1_

  - [ ]* 7.2 Escrever teste de propriedade para validação de dados
    - **Property 3: Pet Data Validation**  
    - **Validates: Requirements 2.4**

  - [x] 7.3 Criar API routes para pets
    - Implementar GET /api/pets com filtros e paginação
    - Implementar POST /api/pets com validação completa
    - Implementar PATCH /api/pets/[id] para edição
    - Implementar DELETE /api/pets/[id] com arquivamento
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7_

  - [x] 7.4 Implementar componentes de pet management
    - Criar PetForm com upload de imagens integrado
    - Implementar PetCard com otimização de imagens
    - Criar PetDetails com galeria completa
    - Implementar PetList com infinite scroll
    - _Requirements: 2.1, 2.5, 4.8, 5.2_

  - [ ]* 7.5 Escrever testes unitários para CRUD pets
    - Testar criação, edição e arquivamento de pets
    - Testar componentes com dados mock
    - _Requirements: 2.1, 2.5, 2.6, 2.7_

- [x] 8. Catálogo público com filtros
  - [x] 8.1 Implementar página de catálogo público
    - Criar /pets com listagem Server Component
    - Implementar PetFilters como Client Component
    - Configurar URL state management para filtros
    - Implementar busca em tempo real
    - _Requirements: 4.1, 4.7, 4.9_

  - [ ]* 8.2 Escrever teste de propriedade para filtro de disponibilidade
    - **Property 6: Available Pets Display Filter**
    - **Validates: Requirements 4.1**

  - [ ]* 8.3 Escrever teste de propriedade para filtro de espécie
    - **Property 7: Species Filter Consistency**
    - **Validates: Requirements 4.2**

  - [ ]* 8.4 Escrever teste de propriedade para filtro de tamanho
    - **Property 8: Size Filter Consistency**
    - **Validates: Requirements 4.3**

  - [ ]* 8.5 Escrever teste de propriedade para filtro de faixa etária
    - **Property 9: Age Range Filter Accuracy**
    - **Validates: Requirements 4.4**

  - [ ]* 8.6 Escrever teste de propriedade para filtro de gênero
    - **Property 10: Gender Filter Consistency**
    - **Validates: Requirements 4.5**

  - [ ]* 8.7 Escrever teste de propriedade para busca textual
    - **Property 11: Text Search Accuracy**
    - **Validates: Requirements 4.6**

  - [x] 8.8 Implementar busca avançada
    - Adicionar filtros por localização e personalidade
    - Implementar filtros por necessidades especiais
    - Criar sistema de salvamento de preferências de busca
    - Implementar ordenação por relevância e distância
    - _Requirements: 10.1, 10.2, 10.3, 10.6, 10.7_

  - [ ]* 8.9 Escrever testes unitários para filtros
    - Testar cada filtro individualmente
    - Testar combinação de múltiplos filtros
    - Testar casos de busca sem resultados
    - _Requirements: 4.2, 4.3, 4.4, 4.5, 4.6, 10.1, 10.5_

- [x] 9. Página de detalhes do pet
  - [x] 9.1 Implementar página /pets/[id]
    - Criar layout de detalhes com informações completas
    - Implementar galeria de imagens com navegação
    - Mostrar informações de saúde e personalidade
    - Exibir informações do proprietário
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 9.2 Adicionar botão de manifestar interesse
    - Implementar botão condicional baseado em status
    - Integrar com sistema de autenticação
    - Criar modal de confirmação
    - _Requirements: 5.5, 5.6_

  - [x] 9.3 Implementar histórias de sucesso
    - Mostrar adoções anteriores do mesmo proprietário
    - Criar componente SuccessStories
    - _Requirements: 5.7_

  - [ ]* 9.4 Escrever testes unitários para detalhes
    - Testar renderização com diferentes status de pet
    - Testar navegação da galeria
    - Testar comportamento do botão de interesse
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [x] 10. Checkpoint - Funcionalidades core completadas
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Sistema de adoção e workflow
  - [x] 11.1 Implementar formulário de adoção
    - Criar AdoptionForm com validação completa
    - Implementar coleta de informações pessoais
    - Adicionar seção de situação de moradia
    - Implementar seção de motivação e experiência
    - _Requirements: 6.1, 6.2_

  - [x] 11.2 Criar API routes para adoção
    - Implementar POST /api/adoptions para criação
    - Implementar PATCH /api/adoptions/[id] para status
    - Adicionar validação de autorização
    - Implementar lógica de status de pet
    - _Requirements: 6.3, 6.5, 6.6, 6.7_

  - [x] 11.3 Implementar sistema de aprovação
    - Criar componente AdoptionRequest para revisão
    - Implementar botões de aprovar/rejeitar
    - Criar modal com formulário de motivo de rejeição
    - _Requirements: 6.5, 6.6_

  - [ ]* 11.4 Escrever testes unitários para workflow
    - Testar criação de solicitação de adoção
    - Testar aprovação e rejeição
    - Testar mudanças de status do pet
    - _Requirements: 6.3, 6.5, 6.6, 6.7, 6.8_

- [x] 12. Sistema de notificações por email
  - [x] 12.1 Configurar serviço de email (Resend)
    - Configurar templates de email HTML
    - Implementar utility functions para envio
    - Criar sistema de retry para falhas
    - _Requirements: 8.1, 8.2, 8.6, 8.7_

  - [x] 12.2 Implementar notificações de adoção
    - Enviar email para proprietário em nova solicitação
    - Notificar adotante sobre mudanças de status
    - Implementar alertas para pets que combinam com preferências
    - _Requirements: 8.1, 8.2, 8.3_

  - [x] 12.3 Adicionar opções de preferências de email
    - Criar sistema de unsubscribe
    - Implementar preferências por tipo de notificação
    - _Requirements: 8.4, 8.5_

  - [ ]* 12.4 Escrever testes unitários para emails
    - Testar envio de diferentes tipos de email
    - Testar retry mechanism
    - Testar unsubscribe functionality
    - _Requirements: 8.1, 8.2, 8.7_

- [x] 13. Dashboard de usuários
  - [x] 13.1 Implementar dashboard base
    - Criar layout de dashboard responsivo
    - Implementar navegação lateral
    - Criar componente StatsCard para métricas
    - _Requirements: 7.3, 7.7_

  - [x] 13.2 Dashboard para adotantes
    - Mostrar pets favoritos e solicitações de adoção
    - Implementar histórico de atividades
    - Criar seção de preferências
    - _Requirements: 7.1, 7.5_

  - [x] 13.3 Dashboard para proprietários/abrigos
    - Listar pets cadastrados com status
    - Mostrar solicitações de adoção recebidas
    - Implementar estatísticas de adoção
    - _Requirements: 7.2, 7.3_

  - [x] 13.4 Implementar edição de perfil
    - Criar formulário de edição de usuário
    - Implementar upload de avatar
    - Adicionar validação de dados
    - _Requirements: 7.4_

  - [ ]* 13.5 Escrever testes unitários para dashboard
    - Testar renderização por tipo de usuário
    - Testar funcionalidades de edição de perfil
    - _Requirements: 7.1, 7.2, 7.4_

- [x] 14. Sistema de abrigos
  - [x] 14.1 Implementar gestão de perfis de abrigos
    - Criar modelo e formulário de abrigo
    - Implementar upload de logo e fotos
    - Adicionar validação de informações obrigatórias
    - _Requirements: 11.1, 11.2, 11.4_

  - [x] 14.2 Integrar abrigos com pets
    - Mostrar informações do abrigo na página do pet
    - Implementar estatísticas de adoção por abrigo
    - Criar páginas públicas de abrigos
    - _Requirements: 11.3, 11.5, 11.6_

  - [x] 14.3 Implementar gestão multi-usuário
    - Permitir múltiplos staffs por abrigo
    - Implementar sistema de permissões
    - _Requirements: 11.7_

  - [ ]* 14.4 Escrever testes unitários para abrigos
    - Testar criação e edição de perfis
    - Testar associação com pets
    - _Requirements: 11.1, 11.2, 11.3_

- [x] 15. Segurança e validação avançada
  - [x] 15.1 Implementar rate limiting
    - Configurar Upstash Redis para rate limiting
    - Aplicar limites diferentes por endpoint
    - Implementar headers de rate limit
    - _Requirements: 12.2, 12.6_

  - [x] 15.2 Implementar sanitização de inputs
    - Criar middleware de sanitização
    - Implementar validação anti-injection
    - Adicionar escape de HTML em outputs
    - _Requirements: 12.1_

  - [x] 15.3 Configurar logging e monitoramento
    - Implementar logging de eventos de segurança
    - Configurar detecção de atividade suspeita
    - Implementar bloqueio automático de contas
    - _Requirements: 12.4, 12.6_

  - [x] 15.4 Implementar HTTPS e compliance
    - Configurar headers de segurança
    - Implementar conformidade LGPD
    - Criar sistema de auditoria
    - _Requirements: 12.3, 12.5, 12.7_

  - [ ]* 15.5 Escrever testes de segurança
    - Testar rate limiting
    - Testar sanitização de inputs
    - Testar proteções contra ataques comuns
    - _Requirements: 12.1, 12.2, 12.6_

- [x] 16. Otimizações de performance
  - [x] 16.1 Implementar otimizações de imagem
    - Configurar lazy loading de imagens
    - Implementar placeholders blur
    - Otimizar tamanhos e formatos automáticos
    - _Requirements: 9.3_

  - [x] 16.2 Implementar caching e otimizações de banco
    - Adicionar índices otimizados para queries
    - Implementar connection pooling
    - Configurar query optimization utilities
    - _Requirements: Performance geral_

  - [x] 16.3 Implementar infinite scroll e paginação
    - Criar hook useInfiniteScroll
    - Implementar PetListInfinite component
    - Otimizar carregamento incremental
    - _Requirements: 4.7_

  - [ ]* 16.4 Escrever testes de performance
    - Executar auditorias Lighthouse
    - Testar tempos de carregamento
    - _Requirements: 9.1, 9.3_

- [x] 17. Testes de integração e E2E
  - [x]* 17.1 Configurar Playwright para E2E
    - Configurar ambiente de testes E2E
    - Criar fixtures e helpers
    - _Requirements: Todos os fluxos principais_

  - [x]* 17.2 Implementar testes de fluxo completo
    - Testar fluxo completo de adoção
    - Testar cadastro e gerenciamento de pets
    - Testar autenticação e dashboard
    - _Requirements: 1.1-1.7, 2.1-2.7, 6.1-6.8_

  - [x]* 17.3 Escrever testes de responsividade
    - Testar funcionalidades em diferentes viewports
    - Verificar navegação touch-friendly
    - _Requirements: 9.1, 9.2, 9.5_

- [x] 18. Final checkpoint e otimizações
  - Ensure all tests pass, ask the user if questions arise.
  - Verificar cobertura de testes (mínimo 80%)
  - Executar auditoria de acessibilidade completa
  - Otimizar bundle size e performance
  - Verificar compliance com requirements

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia requirements específicos para rastreabilidade
- Checkpoints garantem validação incremental e oportunidade para esclarecimentos
- Property tests validam propriedades universais de correção
- Tests unitários validam exemplos específicos e casos extremos
- A implementação segue arquitetura server-first com Next.js 16.x App Router
- JavaScript ES2024 é usado consistentemente em toda a implementação
- Testes de propriedade usam fast-check com mínimo 100 iterações cada
- Componentes seguem padrões de acessibilidade e responsividade

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "2.3"] },
    { "id": 2, "tasks": ["2.2", "2.4", "3.1"] },
    { "id": 3, "tasks": ["3.2", "3.3", "4.1"] },
    { "id": 4, "tasks": ["3.4", "4.2", "4.3", "6.1"] },
    { "id": 5, "tasks": ["6.2", "6.3", "6.4", "7.1"] },
    { "id": 6, "tasks": ["6.5", "7.2", "7.3"] },
    { "id": 7, "tasks": ["7.4", "7.5"] },
    { "id": 8, "tasks": ["8.1"] },
    { "id": 9, "tasks": ["8.2", "8.3", "8.4", "8.5", "8.6", "8.7", "8.8"] },
    { "id": 10, "tasks": ["8.9", "9.1"] },
    { "id": 11, "tasks": ["9.2", "9.3", "9.4"] },
    { "id": 12, "tasks": ["11.1", "11.2"] },
    { "id": 13, "tasks": ["11.3", "11.4", "12.1"] },
    { "id": 14, "tasks": ["12.2", "12.3", "13.1"] },
    { "id": 15, "tasks": ["12.4", "13.2", "13.3"] },
    { "id": 16, "tasks": ["13.4", "13.5", "14.1"] },
    { "id": 17, "tasks": ["14.2", "14.3", "14.4"] },
    { "id": 18, "tasks": ["15.1", "15.2", "15.3"] },
    { "id": 19, "tasks": ["15.4", "15.5", "16.1"] },
    { "id": 20, "tasks": ["16.2", "16.3", "16.4"] },
    { "id": 21, "tasks": ["17.1"] },
    { "id": 22, "tasks": ["17.2", "17.3"] },
    { "id": 23, "tasks": ["18"] }
  ]
}
```