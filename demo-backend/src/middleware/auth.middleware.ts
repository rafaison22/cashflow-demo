import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'demo-jwt-secret-cashflow-2024';

export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).usuario = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalido o expirado' });
  }
};

// En el demo todo el mundo es ADMIN, pero mantenemos los guards para compatibilidad
export const soloAdmin = (req: Request, res: Response, next: NextFunction) => next();
export const soloAdminOOperativo = (req: Request, res: Response, next: NextFunction) => next();
