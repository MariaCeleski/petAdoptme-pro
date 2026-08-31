# Cloudinary Setup Guide

## Objetivo
Implementar upload de imagens otimizado com transformações automáticas usando Cloudinary.

## Pré-requisitos
- Conta Cloudinary (gratuita em https://cloudinary.com)
- Cloud Name, API Key e API Secret

## Passo 1: Criar Conta Cloudinary

1. Acesse https://cloudinary.com/users/register/free
2. Crie uma conta (pode usar email ou GitHub)
3. Após login, você verá o Dashboard com:
   - **Cloud Name** (ex: `djhvxc9yq`)
   - **API Key** (ex: `123456789012345`)
   - **API Secret** (ex: `abc123def456ghi789`)

## Passo 2: Configurar Variáveis de Ambiente

Adicione ao `.env.local` do `apps/api/`:

```env
CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=seu-api-secret
CLOUDINARY_UPLOAD_PRESET=seu-preset-unsigned  # Para uploads do frontend
```

### Criar Upload Preset (Unsigned)
1. Vá para Settings → Upload
2. Clique em "Add upload preset"
3. Nome: `petadopt-unsigned`
4. Unsigned: **ON**
5. Folder: `petadopt/pets`
6. Save

## Passo 3: Variáveis de Ambiente

```env
# Backend
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret

# Frontend (público)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=petadopt-unsigned
```

## Features Implementadas

### 1. Upload de Imagens
- Upload único ou múltiplo
- Validação de tipo (PNG, JPG, WebP)
- Validação de tamanho (máx 10MB)
- Armazenamento em pasta `petadopt/pets/{petId}`

### 2. Transformações Automáticas
- **Thumbnail**: 200x200px, cropped
- **Avatar**: 500x500px, rounded
- **Display**: 1200x800px, otimizado
- **Mobile**: 600x400px, otimizado

### 3. Segurança
- Validação de MIME type no backend
- Rate limiting para uploads
- Assinatura de requests com API Secret
- Uploads não-assinados apenas para clientes autenticados

### 4. Performance
- Compressão automática
- Lazy loading no frontend
- Blur placeholders
- Formatos otimizados (WebP com fallback)

## API Endpoints

### POST `/api/upload`
Upload uma ou múltiplas imagens.

**Request:**
```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Authorization: Bearer <token>" \
  -F "files=@image1.jpg" \
  -F "files=@image2.png" \
  -F "petId=pet-123"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "url": "https://res.cloudinary.com/.../image.jpg",
      "publicId": "petadopt/pets/pet-123/image",
      "transformations": {
        "thumbnail": "https://res.cloudinary.com/.../image/c_crop,w_200,h_200/...",
        "avatar": "https://res.cloudinary.com/.../image/c_thumb,w_500,h_500,r_max/...",
        "display": "https://res.cloudinary.com/.../image/w_1200,h_800,c_fill/..."
      }
    }
  ]
}
```

### DELETE `/api/upload/:publicId`
Delete uma imagem.

**Request:**
```bash
curl -X DELETE http://localhost:3001/api/upload/petadopt%2Fpets%2Fpet-123%2Fimage \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "success": true,
  "message": "Imagem deletada com sucesso"
}
```

## Frontend Integration

```javascript
// Hook para upload
const { uploadImages, loading, error } = useCloudinaryUpload();

// Upload
const urls = await uploadImages(files, petId);

// Display com transformações
<Image
  src={url.replace('/upload/', '/upload/w_1200,h_800,c_fill/')}
  alt="Pet"
  width={1200}
  height={800}
  priority
/>

// Thumbnail
<Image
  src={url.replace('/upload/', '/upload/c_crop,w_200,h_200/')}
  alt="Thumbnail"
  width={200}
  height={200}
/>
```

## Troubleshooting

### Erro: "Invalid Signature"
- Verificar API Secret correto
- Verificar se timestamp está correto

### Erro: "Quota Exceeded"
- Upgrade para plano pago
- Ou deletar imagens antigas

### Erro: "Invalid File Type"
- Apenas PNG, JPG, WebP aceitos
- Máximo 10MB

## Referências
- [Cloudinary Docs](https://cloudinary.com/documentation)
- [Transformations](https://cloudinary.com/documentation/image_transformation_reference)
- [Upload API](https://cloudinary.com/documentation/image_upload_api)
