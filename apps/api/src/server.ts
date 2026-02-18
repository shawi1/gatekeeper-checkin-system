// Requirements: Backend API server setup
// Purpose: Express server with routes for events, tickets, scanner, and auth
// Links: See docs/requirements-traceability.md

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { prisma } from '@gatekeeper/database';
import { getJWTService } from '@gatekeeper/jwt-core';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());

// CORS configuration
const corsOrigin = process.env.CORS_ORIGIN;
app.use(cors({
  origin: corsOrigin === '*' ? true : (corsOrigin?.split(',') || ['http://localhost:3000', 'http://localhost:3002']),
  credentials: true,
}));
app.use(express.json());

// Initialize JWT service
const jwtService = getJWTService();

// Make services available to routes
app.locals.prisma = prisma;
app.locals.jwtService = jwtService;

// Health check endpoint (NFR-01: System availability monitoring)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount route modules
import authRoutes from './routes/auth';
import eventsRoutes from './routes/events';
import ticketsRoutes from './routes/tickets';
import scannerRoutes from './routes/scanner';

app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/scanner', scannerRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nGateKeeper API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
