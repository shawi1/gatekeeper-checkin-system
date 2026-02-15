// Requirements: FR-07, FR-08, FR-09, FR-10, FR-11, NFR-01, NFR-03
// Purpose: Scanner validation and real-time attendance statistics
// Links: See docs/requirements-traceability.md sections 3.1.7-3.1.11, 4.1.1, 4.1.3
// ⭐ CRITICAL FILE - Core validation logic

import { Router, Request, Response } from 'express';
import { prisma } from '@gatekeeper/database';
import { getJWTService } from '@gatekeeper/jwt-core';
import { ValidateTicketInput, ValidationResult } from '@gatekeeper/shared-types';

const router = Router();
const jwtService = getJWTService();

/**
 * Validate scanned QR code ticket
 *
 * POST /api/scanner/validate
 *
 * Requirements:
 * - FR-07: QR code validation logic
 * - FR-08: Color-coded feedback (green/yellow/red)
 * - FR-10: Duplicate prevention via nonce checking
 * - FR-11: Multi-step validation process
 * - NFR-01: Sub-1 second latency
 * - NFR-03: Nonce rotation to prevent counterfeiting
 *
 * Multi-step validation:
 * 1. Verify JWT signature
 * 2. Check event match
 * 3. Verify nonce exists in database
 * 4. Check if already checked in (duplicate prevention)
 * 5. Verify status is REGISTERED
 * 6. Atomically update: status = CHECKED_IN, checkInTime = now, rotate nonce
 */
router.post('/validate', async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { token, eventId } = req.body as ValidateTicketInput;

    if (!token || !eventId) {
      return res.status(400).json({
        valid: false,
        color: 'red',
        message: 'Missing token or eventId',
        reason: 'Invalid request',
      } as ValidationResult);
    }

    // Step 1: FR-10 - Verify JWT signature
    const payload = jwtService.verifyTicketToken(token);

    if (!payload) {
      return res.status(200).json({
        valid: false,
        color: 'red',
        message: 'Invalid or counterfeit ticket',
        reason: 'JWT signature verification failed',
      } as ValidationResult);
    }

    // Step 2: FR-11 - Check event match
    if (payload.evt !== eventId) {
      return res.status(200).json({
        valid: false,
        color: 'red',
        message: 'Ticket is for a different event',
        reason: 'Event ID mismatch',
      } as ValidationResult);
    }

    // Step 3: NFR-03 - Verify nonce exists in database (anti-counterfeiting)
    const ticket = await prisma.ticket.findUnique({
      where: {
        nonce: payload.nonce,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(200).json({
        valid: false,
        color: 'red',
        message: 'Ticket not found or counterfeit',
        reason: 'Nonce not found in database',
      } as ValidationResult);
    }

    // Step 4: FR-10 - Check if already checked in (duplicate prevention)
    if (ticket.status === 'CHECKED_IN') {
      const latency = Date.now() - startTime;
      console.log(`[Scanner] Duplicate check-in detected - Latency: ${latency}ms`);

      return res.status(200).json({
        valid: false,
        color: 'yellow',
        message: `Already checked in at ${ticket.checkInTime?.toLocaleTimeString()}`,
        reason: 'Duplicate check-in attempt',
        ticket: {
          ...ticket,
          user: ticket.user,
          event: ticket.event,
        },
      } as ValidationResult);
    }

    // Step 5: FR-05 - Verify status is REGISTERED
    if (ticket.status !== 'REGISTERED') {
      return res.status(200).json({
        valid: false,
        color: 'red',
        message: `Ticket status: ${ticket.status}`,
        reason: `Invalid status: ${ticket.status}`,
      } as ValidationResult);
    }

    // Step 6: NFR-03 - Atomically update status, check-in time, and rotate nonce
    const newNonce = jwtService.rotateNonce();

    const updatedTicket = await prisma.ticket.update({
      where: {
        id: ticket.id,
      },
      data: {
        status: 'CHECKED_IN',
        checkInTime: new Date(),
        nonce: newNonce, // Rotate nonce to prevent reuse
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            dateTime: true,
          },
        },
      },
    });

    // NFR-01: Log latency for performance tracking
    const latency = Date.now() - startTime;
    console.log(`[Scanner] Successful check-in - Latency: ${latency}ms`);

    if (latency > 1000) {
      console.warn(`[Scanner] ⚠️  Latency exceeded 1 second: ${latency}ms`);
    }

    // FR-08: Green success feedback
    res.json({
      valid: true,
      color: 'green',
      message: `Welcome, ${updatedTicket.user.fullName}!`,
      reason: 'Successfully checked in',
      ticket: updatedTicket,
    } as ValidationResult);
  } catch (error) {
    console.error('Validation error:', error);

    const latency = Date.now() - startTime;
    console.error(`[Scanner] Error occurred - Latency: ${latency}ms`);

    res.status(500).json({
      valid: false,
      color: 'red',
      message: 'System error during validation',
      reason: 'Internal server error',
    } as ValidationResult);
  }
});

/**
 * Get real-time attendance statistics
 *
 * GET /api/scanner/stats/:eventId
 *
 * Requirement: FR-09 - Real-time attendance statistics
 */
router.get('/stats/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: {
        id: true,
        title: true,
        capacity: true,
        dateTime: true,
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get ticket counts by status
    const [totalRegistered, totalCheckedIn, totalWaitlisted] = await Promise.all([
      prisma.ticket.count({
        where: {
          eventId,
          status: 'REGISTERED',
        },
      }),
      prisma.ticket.count({
        where: {
          eventId,
          status: 'CHECKED_IN',
        },
      }),
      prisma.ticket.count({
        where: {
          eventId,
          status: 'WAITLISTED',
        },
      }),
    ]);

    const totalTickets = totalRegistered + totalCheckedIn;
    const checkInRate = totalTickets > 0 ? (totalCheckedIn / totalTickets) * 100 : 0;

    res.json({
      eventId: event.id,
      eventTitle: event.title,
      totalRegistered,
      totalCheckedIn,
      totalWaitlisted,
      capacity: event.capacity,
      checkInRate: Math.round(checkInRate * 100) / 100, // Round to 2 decimals
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

/**
 * Get recent check-ins for an event
 *
 * GET /api/scanner/recent-checkins/:eventId
 *
 * Requirement: FR-09 - Real-time event monitoring
 */
router.get('/recent-checkins/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const recentCheckIns = await prisma.ticket.findMany({
      where: {
        eventId,
        status: 'CHECKED_IN',
      },
      orderBy: {
        checkInTime: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.json(recentCheckIns);
  } catch (error) {
    console.error('Error fetching recent check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch recent check-ins' });
  }
});

export default router;
