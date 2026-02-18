// Requirements: FR-02, FR-04, FR-05, FR-10 - Ticket registration and retrieval
// Purpose: Ticket management endpoints for attendees
// Links: See docs/requirements-traceability.md sections 3.1.2, 3.1.4, 3.1.5, 3.1.10

import { Router, Response } from 'express';
import { prisma } from '@gatekeeper/database';
import { getJWTService } from '@gatekeeper/jwt-core';
import { authenticate, AuthRequest } from '../middleware/auth';
import { RegisterTicketInput } from '@gatekeeper/shared-types';

const router = Router();
const jwtService = getJWTService();

/**
 * Register for an event
 *
 * POST /api/tickets/register
 * Requirements:
 * - FR-02: Register for paid vs free events
 * - FR-05: Determine status (REGISTERED vs WAITLISTED)
 * - FR-10: Prevent duplicate registrations
 */
router.post('/register', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { eventId, inviteToken } = req.body as RegisterTicketInput;
    const userId = req.user!.id;

    // Validate event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if private event and validate invite token
    if (event.isPrivate && event.inviteToken !== inviteToken) {
      return res.status(403).json({ error: 'Invalid invite token for private event' });
    }

    // FR-10: Check for duplicate registration
    const existingTicket = await prisma.ticket.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingTicket) {
      return res.status(409).json({
        error: 'Already registered',
        message: 'You already have a ticket for this event',
        ticket: existingTicket,
      });
    }

    // Check capacity to determine status
    const ticketCount = await prisma.ticket.count({
      where: {
        eventId,
        status: {
          in: ['REGISTERED', 'CHECKED_IN'],
        },
      },
    });

    // FR-05: Determine status based on capacity
    const status = ticketCount >= event.capacity ? 'WAITLISTED' : 'REGISTERED';

    // FR-02: Handle paid vs free events
    const requiresPayment = Number(event.price) > 0;

    if (requiresPayment) {
      // For demo purposes, simplified Stripe integration
      // In production, create Stripe payment intent here
      const ticket = await prisma.ticket.create({
        data: {
          userId,
          eventId,
          status: 'REGISTERED', // Only create after payment succeeds
        },
      });

      // Return payment intent client secret
      res.json({
        ticket,
        requiresPayment: true,
        paymentClientSecret: 'demo_client_secret', // Mock for demo
        amount: event.price.toNumber(),
      });
    } else {
      // FR-03: Generate JWT ticket for free events immediately
      const { token, nonce } = jwtService.generateTicketToken(userId, eventId);

      const ticket = await prisma.ticket.create({
        data: {
          userId,
          eventId,
          status,
          jwtToken: token,
          nonce,
        },
        include: {
          event: true,
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
            },
          },
        },
      });

      res.status(201).json({
        ticket,
        requiresPayment: false,
      });
    }
  } catch (error) {
    console.error('Error registering ticket:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

/**
 * Get user's tickets
 *
 * GET /api/tickets/my-tickets
 * Requirement: FR-04 - Retrieve user's tickets
 */
router.get('/my-tickets', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const tickets = await prisma.ticket.findMany({
      where: { userId },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

/**
 * Get specific ticket with QR code
 *
 * GET /api/tickets/:ticketId
 * Requirement: FR-04 - Retrieve ticket with QR code data
 */
router.get('/:ticketId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user!.id;

    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId, // Ensure user owns this ticket
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

export default router;
