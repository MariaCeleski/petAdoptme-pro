import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength, validateEmail } from '@/lib/auth-utils';

export async function POST(request) {
  try {
    const { token, email, password } = await request.json();

    // Validar dados de entrada
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios', code: 'VALIDATION_ERROR' },
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

    // Verificar token
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Token não expirado
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    const hashedPassword = await hashPassword(password);

    // Atualizar senha e limpar tokens de reset
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        // Se o email ainda não foi verificado e está fazendo reset, marcar como verificado
        emailVerified: user.emailVerified || new Date(),
      }
    });

    return NextResponse.json({
      message: 'Senha redefinida com sucesso! Você pode fazer login agora.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    // Validar parâmetros
    if (!token || !email) {
      return NextResponse.json(
        { error: 'Token e email são obrigatórios', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    // Verificar se token é válido
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        resetTokenExpiry: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado', code: 'INVALID_TOKEN' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      expiresAt: user.resetTokenExpiry
    });

  } catch (error) {
    console.error('Validate reset token error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}