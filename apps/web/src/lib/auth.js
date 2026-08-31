import { PrismaAdapter } from '@next-auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: { 
          label: 'Email', 
          type: 'email',
          placeholder: 'seu@email.com'
        },
        password: { 
          label: 'Senha', 
          type: 'password',
          placeholder: 'Digite sua senha'
        }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        // Validar formato do email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          throw new Error('Formato de email inválido');
        }

        // Validar tamanho mínimo da senha
        if (credentials.password.length < 8) {
          throw new Error('Senha deve ter pelo menos 8 caracteres');
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() }
          });

          if (!user) {
            throw new Error('Usuário não encontrado');
          }

          if (!user.password) {
            throw new Error('Esta conta usa login social. Use o Google para fazer login.');
          }

          // Verificar se o email foi verificado
          if (!user.emailVerified) {
            throw new Error('Email não verificado. Verifique sua caixa de entrada.');
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            throw new Error('Senha incorreta');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            type: user.type,
            avatar: user.avatar,
            emailVerified: user.emailVerified,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.picture,
          emailVerified: new Date(), // Google profiles are pre-verified
          type: 'ADOPTER', // Default type for OAuth users
        };
      },
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para OAuth providers, sempre permitir signin
      if (account?.provider === 'google') {
        return true;
      }
      
      // Para credentials, verificar se o usuário existe e está verificado
      if (account?.provider === 'credentials') {
        return user?.emailVerified ? true : false;
      }
      
      return false;
    },
    async jwt({ token, user, account }) {
      // Primeira vez fazendo login
      if (user && account) {
        token.type = user.type;
        token.emailVerified = user.emailVerified;
        
        // Se for login OAuth, garantir que o usuário existe no banco
        if (account.provider === 'google') {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email }
          });
          
          if (existingUser) {
            token.type = existingUser.type;
            token.id = existingUser.id;
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub;
        session.user.type = token.type;
        session.user.emailVerified = token.emailVerified;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Permite redirects para URLs relativas ou do mesmo domínio
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      } else if (new URL(url).origin === baseUrl) {
        return url;
      }
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User ${user.email} signed in via ${account.provider}`);
      
      if (isNewUser) {
        console.log(`New user registered: ${user.email}`);
        
        // Create email preferences for new user
        try {
          const { getOrCreateEmailPreferences } = await import('./email/preferences');
          await getOrCreateEmailPreferences(user.id);
          console.log(`Email preferences created for user ${user.id}`);
        } catch (error) {
          console.error(`Failed to create email preferences for user ${user.id}:`, error);
        }
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};