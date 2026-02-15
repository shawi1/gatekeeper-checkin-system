// Requirement: FR-01 - User authentication for protected endpoints
// Purpose: JWT-based authentication middleware
// Links: See docs/requirements-traceability.md section 3.1.1

import { Request, Response, NextFunction } from 'express';
import { getJWTService } from '@gatekeeper/jwt-core';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Authenticate user from JWT access token
 *
 * Requirements:
 * - FR-01: User authentication
 *
 * Extracts JWT from Authorization header and validates it.
 * Attaches user info to request object if valid.
 */
export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'No token provided' });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const jwtService = getJWTService();

  const payload = jwtService.verifyAccessToken(token);

  if (!payload) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }

  // Attach user info to request
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
  };

  next();
}

/**
 * Require specific role for endpoint access
 *
 * Requirement: FR-01 - Role-based access control
 *
 * @param roles - Array of allowed roles
 */
export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient permissions' });
    }

    next();
  };
}
