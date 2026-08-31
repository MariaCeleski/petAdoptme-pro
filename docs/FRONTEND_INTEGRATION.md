# Frontend Integration Guide

## Overview
O frontend é um aplicativo Next.js 16+ com React 19+ integrado ao backend Express via API REST.

## Estrutura

```
apps/web/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # Reusable components
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   ├── styles/              # CSS modules
│   └── middleware.js        # Auth middleware
├── public/                  # Static assets
├── .env.example             # Environment variables template
└── next.config.js           # Next.js configuration
```

## Hooks Disponíveis

### useApi()
Hook para chamadas de API com autenticação automática.

```javascript
import { useApi } from '@/hooks/useApi';

function MyComponent() {
  const { request, loading, error } = useApi();

  const fetchData = async () => {
    try {
      const data = await request('/api/pets');
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  return <button onClick={fetchData}>Buscar</button>;
}
```

### usePets()
Hook para gerenciamento de pets.

```javascript
import { usePets } from '@/hooks/usePets';

function PetsList() {
  const { pets, fetchPets, loading, error } = usePets();

  useEffect(() => {
    fetchPets({ status: 'AVAILABLE' });
  }, []);

  return (
    <div>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error}</p>}
      {pets.map(pet => (
        <div key={pet.id}>{pet.name}</div>
      ))}
    </div>
  );
}
```

### useCloudinaryUpload()
Hook para upload de imagens.

```javascript
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';

function ImageUpload({ petId }) {
  const { uploadImages, loading, error, progress } = useCloudinaryUpload();

  const handleUpload = async (files) => {
    try {
      const images = await uploadImages(files, petId);
      console.log('Uploaded:', images);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple
        onChange={(e) => handleUpload(e.target.files)}
        disabled={loading}
      />
      {loading && <p>Progresso: {progress}%</p>}
      {error && <p>Erro: {error}</p>}
    </div>
  );
}
```

## Variáveis de Ambiente

Crie `.env.local` na raiz de `apps/web/`:

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001

# Cloudinary (para uploads do frontend)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=petadopt-unsigned

# NextAuth (se usar)
NEXTAUTH_SECRET=seu-secret-aleatorio
NEXTAUTH_URL=http://localhost:3000
```

## Componentes Principais

### PetCard
Exibe card de pet com imagem e informações.

```javascript
<PetCard
  pet={petData}
  onViewDetails={() => navigate(`/pets/${petData.id}`)}
  onAdopt={() => handleAdoption(petData.id)}
/>
```

### PetForm
Formulário para criar/editar pet.

```javascript
<PetForm
  onSubmit={handleSave}
  initialData={petData}
  isEditing={!!petId}
/>
```

### AdoptionForm
Formulário para solicitar adoção.

```javascript
<AdoptionForm
  petId={petId}
  onSubmit={handleAdoptionRequest}
/>
```

## Fluxos Principais

### 1. Listar Pets Públicos
- GET `/api/pets` → Retorna pets com status 'AVAILABLE'
- Filtro por espécie, tamanho, idade, gênero
- Paginação: 10 pets por página

### 2. Criar Pet (Tutor)
- POST `/api/pets` → Cria novo pet
- Upload de imagens via `/api/upload`
- Associa ao usuário autenticado

### 3. Solicitar Adoção
- POST `/api/adoptions` → Cria solicitação
- Envia email para tutor do pet
- Status inicial: 'PENDING'

### 4. Aprovar/Rejeitar Adoção (Tutor)
- PATCH `/api/adoptions/{id}` → Atualiza status
- APPROVED ou REJECTED
- Envia email para adotante

## Performance

### Otimizações Implementadas
1. **Image Optimization**: Next.js Image com lazy loading
2. **Code Splitting**: Dynamic imports para pages
3. **Caching**: Revalidação com SWR/React Query
4. **Pagination**: Infinite scroll ou pagination
5. **Compression**: Gzip + Brotli

### Lighthouse Targets
- **Performance**: ≥ 90
- **Accessibility**: ≥ 95
- **Best Practices**: ≥ 90
- **SEO**: ≥ 90

## Deployment

### Vercel
```bash
# Push para main
git push origin main

# Deploy automático via Vercel
# Defina env vars na dashboard
```

### Docker
```bash
# Build
docker build -f Dockerfile -t petadopt-web .

# Run
docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://api:3001 petadopt-web
```

## Troubleshooting

### Erro: "API call failed"
- Verificar se backend está rodando em http://localhost:3001
- Verificar NEXT_PUBLIC_API_URL em .env.local

### Erro: "Cloudinary upload failed"
- Verificar NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- Verificar upload preset existe
- Verificar credenciais

### Erro: "Unauthorized"
- Verificar se sessão está válida
- Fazer logout e login novamente
- Verificar token JWT

## Próximas Etapas

1. Integrar banco de dados real (Supabase)
2. Implementar busca em tempo real
3. Adicionar favoritos/wishlist
4. Dashboard completo
5. Notificações push
6. Testes E2E com Playwright
