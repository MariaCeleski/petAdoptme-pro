/**
 * Security Event Logging and Audit System
 * 
 * Implementa logging de eventos de segurança para monitoramento
 * Requisitos: 12.4, 12.6
 */

import { prisma } from '@/lib/prisma.js';

/**
 * Tipos de eventos de segurança
 */
export const SECURITY_EVENT_TYPES = {
  // Autenticação
  AUTH_LOGIN_SUCCESS: 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  AUTH_REGISTER: 'AUTH_REGISTER',
  AUTH_PASSWORD_RESET: 'AUTH_PASSWORD_RESET',
  AUTH_EMAIL_VERIFIED: 'AUTH_EMAIL_VERIFIED',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  RATE_LIMIT_BLOCKED: 'RATE_LIMIT_BLOCKED',
  
  // Validação
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INJECTION_ATTEMPT: 'INJECTION_ATTEMPT',
  
  // Dados
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  DATA_DELETION: 'DATA_DELETION',
  
  // Acesso
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  FORBIDDEN_ACCESS: 'FORBIDDEN_ACCESS',
  
  // Atividade suspeita
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  ACCOUNT_LOCK: 'ACCOUNT_LOCK',
  ACCOUNT_UNLOCK: 'ACCOUNT_UNLOCK',
  
  // Upload
  FILE_UPLOAD: 'FILE_UPLOAD',
  FILE_DELETE: 'FILE_DELETE',
  MALICIOUS_FILE: 'MALICIOUS_FILE',
};

/**
 * Severidades de evento
 */
export const EVENT_SEVERITY = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
};

/**
 * Logger de eventos de segurança
 */
class SecurityAuditLogger {
  constructor() {
    this.inMemoryLogs = [];
    this.maxInMemoryLogs = 1000;
  }

  /**
   * Log um evento de segurança
   */
  async logEvent(eventData) {
    const event = {
      id: this.generateEventId(),
      timestamp: new Date(),
      type: eventData.type || SECURITY_EVENT_TYPES.DATA_ACCESS,
      severity: eventData.severity || EVENT_SEVERITY.INFO,
      userId: eventData.userId || null,
      email: eventData.email || null,
      clientIp: eventData.clientIp || null,
      userAgent: eventData.userAgent || null,
      action: eventData.action || '',
      resource: eventData.resource || null,
      details: eventData.details || {},
      status: eventData.status || 'success',
      error: eventData.error || null,
    };

    // Armazenar em memória para acesso rápido
    this.storeInMemory(event);

    // Tentar persistir no banco de dados
    try {
      await this.persistEvent(event);
    } catch (error) {
      console.error('Erro ao persistir evento de segurança:', error);
      // Continuar mesmo se falhar na persistência
    }

    // Verificar se há atividade suspeita
    await this.checkSuspiciousActivity(event);

    return event;
  }

  /**
   * Armazenar em memória com FIFO
   */
  storeInMemory(event) {
    this.inMemoryLogs.push(event);

    // Manter apenas os últimos N logs
    if (this.inMemoryLogs.length > this.maxInMemoryLogs) {
      this.inMemoryLogs.shift();
    }
  }

  /**
   * Persistir evento no banco de dados
   */
  async persistEvent(event) {
    // Se usar tabela de auditoria em Prisma
    if (prisma.auditLog) {
      await prisma.auditLog.create({
        data: {
          eventId: event.id,
          type: event.type,
          severity: event.severity,
          userId: event.userId,
          clientIp: event.clientIp,
          userAgent: event.userAgent,
          action: event.action,
          resource: event.resource,
          details: event.details,
          status: event.status,
          error: event.error,
          createdAt: event.timestamp,
        },
      });
    }
  }

  /**
   * Verificar atividade suspeita
   */
  async checkSuspiciousActivity(event) {
    // Verificar rate limit excedido
    if (event.type === SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED) {
      const recentEvents = this.getRecentEventsByIp(event.clientIp, 60); // últimos 60s
      const exceedCount = recentEvents.filter(e => 
        e.type === SECURITY_EVENT_TYPES.RATE_LIMIT_EXCEEDED
      ).length;

      // Se mais de 5 excedências em 60s, está suspeito
      if (exceedCount > 5) {
        await this.flagSuspiciousActivity(event, 'Múltiplas violações de rate limit');
      }
    }

    // Verificar múltiplas tentativas de login falhadas
    if (event.type === SECURITY_EVENT_TYPES.AUTH_LOGIN_FAILED) {
      const recentFailures = this.getRecentEventsByIdentifier(
        event.email || event.clientIp,
        300 // últimos 5 minutos
      ).filter(e => e.type === SECURITY_EVENT_TYPES.AUTH_LOGIN_FAILED);

      // Se mais de 5 tentativas falhadas, bloquear conta
      if (recentFailures.length > 5) {
        await this.blockAccount(event.userId || event.email, 'Múltiplas tentativas de login falhadas');
      }
    }

    // Verificar injeção detectada
    if (event.type === SECURITY_EVENT_TYPES.INJECTION_ATTEMPT) {
      await this.flagSuspiciousActivity(event, 'Tentativa de injeção detectada');
      
      // Bloquear automaticamente após múltiplas tentativas
      const recentInjections = this.getRecentEventsByIp(event.clientIp, 3600).filter(e =>
        e.type === SECURITY_EVENT_TYPES.INJECTION_ATTEMPT
      );

      if (recentInjections.length > 3) {
        await this.blockIpTemporarily(event.clientIp, 3600, 'Múltiplas tentativas de injeção');
      }
    }
  }

  /**
   * Marcar como atividade suspeita
   */
  async flagSuspiciousActivity(event, reason) {
    const suspiciousEvent = {
      ...event,
      type: SECURITY_EVENT_TYPES.SUSPICIOUS_ACTIVITY,
      severity: EVENT_SEVERITY.WARNING,
      details: {
        ...event.details,
        reason,
        originalEvent: event.type,
      },
    };

    await this.logEvent(suspiciousEvent);

    // Log console para alertar
    console.warn(`⚠️ ATIVIDADE SUSPEITA: ${reason}`, {
      ip: event.clientIp,
      userId: event.userId,
      eventType: event.type,
      timestamp: event.timestamp,
    });
  }

  /**
   * Bloquear conta de usuário
   */
  async blockAccount(userIdentifier, reason) {
    try {
      // Buscar usuário
      const user = await prisma.user.findUnique({
        where: userIdentifier.includes('@') ? 
          { email: userIdentifier } : 
          { id: userIdentifier },
      });

      if (user) {
        // Marcar como bloqueado
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lockedUntil: new Date(Date.now() + 3600000), // 1 hora
            lockReason: reason,
          },
        });

        // Log do bloqueio
        await this.logEvent({
          type: SECURITY_EVENT_TYPES.ACCOUNT_LOCK,
          severity: EVENT_SEVERITY.CRITICAL,
          userId: user.id,
          email: user.email,
          action: 'Account blocked automatically',
          details: { reason },
        });

        console.error(`🔒 CONTA BLOQUEADA: ${userIdentifier} - ${reason}`);
      }
    } catch (error) {
      console.error('Erro ao bloquear conta:', error);
    }
  }

  /**
   * Bloquear IP temporariamente
   */
  async blockIpTemporarily(ip, duration = 3600, reason = '') {
    // Implementação depende de infra de backend
    // Aqui apenas logamos
    await this.logEvent({
      type: SECURITY_EVENT_TYPES.RATE_LIMIT_BLOCKED,
      severity: EVENT_SEVERITY.CRITICAL,
      clientIp: ip,
      action: 'IP blocked temporarily',
      details: {
        duration,
        reason,
        blockedUntil: new Date(Date.now() + duration * 1000),
      },
    });

    console.error(`🚫 IP BLOQUEADO: ${ip} por ${duration}s - ${reason}`);
  }

  /**
   * Obter eventos recentes por IP
   */
  getRecentEventsByIp(ip, secondsAgo = 300) {
    const cutoff = new Date(Date.now() - secondsAgo * 1000);
    return this.inMemoryLogs.filter(log =>
      log.clientIp === ip && log.timestamp > cutoff
    );
  }

  /**
   * Obter eventos recentes por identificador (email ou IP)
   */
  getRecentEventsByIdentifier(identifier, secondsAgo = 300) {
    const cutoff = new Date(Date.now() - secondsAgo * 1000);
    return this.inMemoryLogs.filter(log =>
      (log.email === identifier || log.clientIp === identifier) && 
      log.timestamp > cutoff
    );
  }

  /**
   * Gerar ID único para evento
   */
  generateEventId() {
    return `EVT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obter logs em memória (para debug/admin)
   */
  getInMemoryLogs(filter = {}) {
    let logs = [...this.inMemoryLogs];

    if (filter.type) {
      logs = logs.filter(log => log.type === filter.type);
    }

    if (filter.severity) {
      logs = logs.filter(log => log.severity === filter.severity);
    }

    if (filter.userId) {
      logs = logs.filter(log => log.userId === filter.userId);
    }

    if (filter.clientIp) {
      logs = logs.filter(log => log.clientIp === filter.clientIp);
    }

    if (filter.limit) {
      logs = logs.slice(-filter.limit);
    }

    return logs;
  }

  /**
   * Limpar logs em memória
   */
  clearInMemoryLogs() {
    this.inMemoryLogs = [];
  }
}

// Exportar instância singleton
export const auditLogger = new SecurityAuditLogger();

/**
 * Função helper para logar eventos de API
 */
export async function logApiEvent(request, eventData) {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                   request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') ||
                   'unknown';

  const userAgent = request.headers.get('user-agent') || '';

  // Extrair informações da requisição
  const url = new URL(request.url);
  const resource = url.pathname;
  const action = `${request.method} ${resource}`;

  return auditLogger.logEvent({
    clientIp,
    userAgent,
    resource,
    action,
    ...eventData,
  });
}
