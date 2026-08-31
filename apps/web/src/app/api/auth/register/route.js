import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validateEmail, validatePasswordStrength } from '@/lib/auth-utils';

export async function POST(request) {
  try {
    const { name, email, password, type } = await request.json();

    // Validar dados de entrada
    if (!name || !email || !password || !type) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validar nome
    if (name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Nome deve ter pelo menos 2 caracteres', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validar email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.errors[0], code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validar senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0], code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Validar tipo de usuário
    const validTypes = ['ADOPTER', 'INDIVIDUAL_OWNER', 'SHELTER_ADMIN'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de usuário inválido', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado', code: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        type,
        // Para desenvolvimento, marcar email como verificado
        // Em produção, isso seria feito via link de verificação
        emailVerified: process.env.NODE_ENV === 'development' ? new Date() : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        type: true,
        emailVerified: true,
        createdAt: true,
      }
    });

    // Em produção, aqui enviaríamos um email de verificação
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implementar envio de email de verificação
      console.log('TODO: Send verification email to', user.email);
    }

    return NextResponse.json(
      { 
        message: process.env.NODE_ENV === 'development' 
          ? 'Conta criada com sucesso! Você pode fazer login agora.'
          : 'Conta criada! Verifique seu email para ativar a conta.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: user.type,
        }
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Erro de constraint do Prisma (email duplicado)
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      return NextResponse.json(
        { error: 'Este email já está cadastrado', code: 'USER_EXISTS' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}