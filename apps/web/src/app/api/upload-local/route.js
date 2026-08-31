import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomBytes } from 'crypto';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * POST /api/upload-local - Upload imagens para servidor local
 * Salva arquivos em public/uploads/ com nomes seguros
 * Retorna URL relativa para salvar no BD
 */
export async function POST(request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({
        error: 'Autenticação necessária',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({
        error: 'Nenhum arquivo enviado',
        code: 'NO_FILE'
      }, { status: 400 });
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return Response.json({
        error: 'Formato não suportado. Use JPG, PNG ou WebP.',
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }

    // Validar tamanho (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return Response.json({
        error: 'Arquivo muito grande. Máximo 5MB.',
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
    }

    // Ler arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Gerar nome de arquivo seguro
    const timestamp = Date.now();
    const random = randomBytes(8).toString('hex');
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `pet-${timestamp}-${random}.${ext}`;

    // Criar diretório se não existir
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (err) {
      console.error('Erro ao criar diretório:', err);
      // Continuar mesmo se falhar (pode já existir)
    }

    // Salvar arquivo
    const filepath = join(uploadDir, filename);
    await writeFile(filepath, buffer);

    // Retornar URL relativa
    const url = `/uploads/${filename}`;

    console.log(`✅ Arquivo salvo: ${filename}`);

    return Response.json({
      success: true,
      url,
      filename,
      size: file.size,
      type: file.type
    }, { status: 200 });

  } catch (error) {
    console.error('Erro no upload:', error);

    // Distinguir entre erros diferentes
    if (error.code === 'ENOSPC') {
      return Response.json({
        error: 'Espaço em disco insuficiente',
        code: 'NO_SPACE'
      }, { status: 507 });
    }

    if (error.code === 'EACCES') {
      return Response.json({
        error: 'Permissão negada ao salvar arquivo',
        code: 'PERMISSION_DENIED'
      }, { status: 403 });
    }

    return Response.json({
      error: error.message || 'Erro ao fazer upload',
      code: 'INTERNAL_ERROR'
    }, { status: 500 });
  }
}

/**
 * OPTIONS /api/upload-local - CORS preflight
 */
export async function OPTIONS(request) {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
