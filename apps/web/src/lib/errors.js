// Custom Error Classes
export class APIError extends Error {
  constructor(message, status = 500, code = 'API_ERROR') {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
  }
}

export class ValidationError extends APIError {
  constructor(details, message = 'Validation failed') {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

// Error Handler for API Routes
export function handleAPIError(error) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json({
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp: new Date().toISOString()
    }, { status: error.status });
  }

  // Handle Prisma errors
  if (error.code === 'P2002') {
    return Response.json({
      error: 'Registro já existe',
      code: 'DUPLICATE_ENTRY',
      timestamp: new Date().toISOString()
    }, { status: 409 });
  }

  if (error.code === 'P2025') {
    return Response.json({
      error: 'Registro não encontrado',
      code: 'NOT_FOUND',
      timestamp: new Date().toISOString()
    }, { status: 404 });
  }

  // Generic error
  return Response.json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    timestamp: new Date().toISOString()
  }, { status: 500 });
}

// Upload Error Messages
export const uploadErrorMessages = {
  FILE_TOO_LARGE: 'Arquivo muito grande. Tamanho máximo: 5MB',
  INVALID_FORMAT: 'Formato inválido. Use JPEG, PNG ou WebP',
  UPLOAD_FAILED: 'Falha no upload. Tente novamente',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet',
  QUOTA_EXCEEDED: 'Limite de arquivos excedido',
  PROCESSING_FAILED: 'Falha no processamento da imagem'
};

export function handleUploadError(error) {
  if (error.code === 'LIMIT_FILE_SIZE') {
    throw new ValidationError({ message: uploadErrorMessages.FILE_TOO_LARGE });
  }
  
  if (error.code === 'INVALID_FILE_TYPE') {
    throw new ValidationError({ message: uploadErrorMessages.INVALID_FORMAT });
  }
  
  if (error.code === 'NETWORK_ERROR') {
    throw new APIError(uploadErrorMessages.NETWORK_ERROR, 503, 'SERVICE_UNAVAILABLE');
  }
  
  // Default error
  throw new APIError(uploadErrorMessages.UPLOAD_FAILED, 500, 'UPLOAD_ERROR');
}