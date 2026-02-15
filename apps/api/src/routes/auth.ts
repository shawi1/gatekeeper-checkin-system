// Requirement: FR-01 - User authentication and registration
// Purpose: Authentication endpoints for user registration and login
// Links: See docs/requirements-traceability.md section 3.1.1

import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '@gatekeeper/database';
import { getJWTService } from '@gatekeeper/jwt-core';
import { RegisterInput, LoginInput } from '@gatekeeper/shared-types';

const router = Router();
const jwtService = getJWTService();

/**
 * Register new user account
 *
 * POST /api/auth/register
 * Requirement: FR-01 - User registration
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, fullName } = req.body as RegisterInput;

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role: 'ATTENDEE', // Default role
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Generate access token
    const token = jwtService.generateAccessToken(user.id, user.email, user.role);

    res.status(201).json({
      token,
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * Login user
 *
 * POST /api/auth/login
 * Requirement: FR-01 - User authentication
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as LoginInput;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate access token
    const token = jwtService.generateAccessToken(user.id, user.email, user.role);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
