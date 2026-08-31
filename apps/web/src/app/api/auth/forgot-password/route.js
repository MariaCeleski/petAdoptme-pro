import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateEmail } from '@/lib/auth-utils';
import { randomBytes } from 'crypto';

export async function POST(request) {
  try {
    console.log('Forgot password API called');
    const { email } = await request.json();
    console.log('Email received:', email);

    // Validar email
    if (!email) {
      return NextResponse.json(
        { error: 'Email é obrigatório', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    console.log('Validating email...');
    const emailValidation = validateEmail(email);
    console.log('Email validation result:', emailValidation);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        { error: emailValidation.errors[0], code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }

    console.log('Looking for user in database...');
    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    console.log('User found:', !!user);

    // Por segurança, sempre retornar sucesso mesmo se email não existir
    // Isso previne enumeração de emails
    if (!user) {
      return NextResponse.json({
        message: 'Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha.'
      });
    }

    // Gerar token de reset
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token válido por 1 hora

    // Salvar token no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      }
    });

    // Em produção, aqui enviaríamos o email
    if (process.env.NODE_ENV === 'development') {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset link: http://localhost:3000/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);
    } else {
      // TODO: Implementar envio de email com template de reset de senha
      console.log('TODO: Send password reset email to', email);
    }

    return NextResponse.json({
      message: 'Se este email estiver cadastrado, você receberá as instruções para redefinir sua senha.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}