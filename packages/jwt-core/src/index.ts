// Requirements: FR-03 - JWT-based QR codes with RS256 signing
// Requirements: NFR-03 - Anti-counterfeiting with unique nonce system
// Purpose: Core JWT token generation and validation for ticket QR codes
// Links: See docs/requirements-traceability.md sections 3.1.3, 4.1.3

import jwt from 'jsonwebtoken';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';
import path from 'path';

export interface TicketPayload {
  sub: string;      // User ID
  evt: string;      // Event ID
  iat: number;      // Issued At timestamp
  nonce: string;    // NFR-03: Unique nonce for anti-counterfeiting
}

export interface UserAuthPayload {
  sub: string;      // User ID
  email: string;    // User email
  role: string;     // User role
  iat: number;
  exp: number;
}

export class JWTService {
  private privateKey: Buffer;
  private publicKey: Buffer;

  constructor(privateKeyPath?: string, publicKeyPath?: string) {
    const rootDir = process.cwd();
    const defaultPrivateKeyPath = path.join(rootDir, '..', '..', 'keys', 'private.pem');
    const defaultPublicKeyPath = path.join(rootDir, '..', '..', 'keys', 'public.pem');

    const privatePath = privateKeyPath || process.env.JWT_PRIVATE_KEY_PATH || defaultPrivateKeyPath;
    const publicPath = publicKeyPath || process.env.JWT_PUBLIC_KEY_PATH || defaultPublicKeyPath;

    this.privateKey = readFileSync(privatePath);
    this.publicKey = readFileSync(publicPath);
  }

  /**
   * Generate a unique cryptographic nonce
   *
   * Requirements:
   * - NFR-03: Anti-counterfeiting via unique nonce
   *
   * @returns 32-byte hex string
   */
  generateNonce(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate JWT ticket token with unique nonce
   *
   * Requirements:
   * - FR-03: JWT-based QR code generation
   * - NFR-03: Include unique nonce for anti-counterfeiting
   *
   * @param userId - User ID (sub claim)
   * @param eventId - Event ID (evt claim)
   * @returns Object with JWT token and nonce
   */
  generateTicketToken(userId: string, eventId: string): { token: string; nonce: string } {
    const nonce = this.generateNonce();

    const payload: TicketPayload = {
      sub: userId,
      evt: eventId,
      iat: Math.floor(Date.now() / 1000),
      nonce,
    };

    const token = jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      // No expiration for tickets - they're valid for the event
    });

    return { token, nonce };
  }

  /**
   * Verify JWT ticket token signature and extract payload
   *
   * Requirements:
   * - FR-10: JWT signature verification
   * - NFR-01: Fast validation (< 1 second)
   *
   * @param token - JWT token from QR code
   * @returns Decoded payload or null if invalid
   */
  verifyTicketToken(token: string): TicketPayload | null {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
      }) as TicketPayload;

      return decoded;
    } catch (error) {
      // Invalid signature, malformed token, etc.
      return null;
    }
  }

  /**
   * Generate access token for user authentication
   *
   * Requirement: FR-01 - User authentication
   *
   * @param userId - User ID
   * @param email - User email
   * @param role - User role
   * @returns JWT access token
   */
  generateAccessToken(userId: string, email: string, role: string): string {
    const payload: UserAuthPayload = {
      sub: userId,
      email,
      role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET || 'fallback_secret_change_in_production';

    return jwt.sign(payload, secret, {
      algorithm: 'HS256',
    });
  }

  /**
   * Verify user access token
   *
   * Requirement: FR-01 - User authentication
   *
   * @param token - JWT access token
   * @returns Decoded payload or null if invalid
   */
  verifyAccessToken(token: string): UserAuthPayload | null {
    try {
      const secret = process.env.JWT_ACCESS_TOKEN_SECRET || 'fallback_secret_change_in_production';

      const decoded = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      }) as UserAuthPayload;

      return decoded;
    } catch (error) {
      return null;
    }
  }

  /**
   * Rotate nonce for ticket (used after check-in to prevent reuse)
   *
   * Requirements:
   * - NFR-03: Nonce rotation prevents ticket counterfeiting
   *
   * @returns New nonce string
   */
  rotateNonce(): string {
    return this.generateNonce();
  }
}

// Export singleton instance
let jwtServiceInstance: JWTService | null = null;

export function getJWTService(): JWTService {
  if (!jwtServiceInstance) {
    jwtServiceInstance = new JWTService();
  }
  return jwtServiceInstance;
}
