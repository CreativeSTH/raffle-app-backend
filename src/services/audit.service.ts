import { Request } from 'express';
import { AuditLog } from '../models/AuditLogs';
import { AuditAction } from '../constants/auditActions';
import requestIp from 'request-ip';

class AuditService {
  async logEvent(
    req: Request,
    action: AuditAction,
    description: string,
    userIdOverride?: string // <-- userId opcional
  ) {
    const userId = userIdOverride || (req as any).userId;

    if (!userId) {
      console.warn('Intento de auditoría sin userId');
      return;
    }

    const ip = requestIp.getClientIp(req) || 'Unknown';

    const userAgent = req.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      userId,
      action,
      description,
      ip,
      userAgent,
      timestamp: new Date(),
    });
  }
}

export const auditService = new AuditService();
