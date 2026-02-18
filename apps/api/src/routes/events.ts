// Requirements: FR-01, FR-13, FR-13.1 - Event management and discovery
// Purpose: Event browsing, creation, and private event access
// Links: See docs/requirements-traceability.md sections 3.1.1, 3.1.13

import { Router, Request, Response } from 'express';
import { prisma } from '@gatekeeper/database';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth';
import { CreateEventInput } from '@gatekeeper/shared-types';
import { randomBytes } from 'crypto';

const router = Router();

/**
 * Browse public events
 *
 * GET /api/events/public
 * Requirement: FR-01 - Public event discovery
 */
router.get('/public', async (req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        isPrivate: false,
        dateTime: {
          gte: new Date(), // Only upcoming events
        },
      },
      orderBy: {
        dateTime: 'asc',
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
            },
          },
        },
      },
    });

    // Add availability info
    const eventsWithAvailability = events.map((event: any) => ({
      ...event,
      ticketsSold: event._count.tickets,
      spotsAvailable: event.capacity - event._count.tickets,
      isSoldOut: event._count.tickets >= event.capacity,
    }));

    res.json(eventsWithAvailability);
  } catch (error) {
    console.error('Error fetching public events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * Access private event by invite token
 *
 * GET /api/events/private/:inviteToken
 * Requirements: FR-01.1, FR-13.1 - Private event access via invite link
 */
router.get('/private/:inviteToken', async (req: Request, res: Response) => {
  try {
    const { inviteToken } = req.params;

    const event = await prisma.event.findUnique({
      where: {
        inviteToken,
        isPrivate: true,
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
          },
        },
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found or invalid invite token' });
    }

    res.json({
      ...event,
      ticketsSold: event._count.tickets,
      spotsAvailable: event.capacity - event._count.tickets,
      isSoldOut: event._count.tickets >= event.capacity,
    });
  } catch (error) {
    console.error('Error fetching private event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * Get event by ID
 *
 * GET /api/events/:id
 * Requirement: FR-01 - Event details
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
            },
          },
        },
      },
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // If private, don't expose unless user has access (simplified for demo)
    if (event.isPrivate) {
      return res.status(403).json({ error: 'This is a private event' });
    }

    res.json({
      ...event,
      ticketsSold: event._count.tickets,
      spotsAvailable: event.capacity - event._count.tickets,
      isSoldOut: event._count.tickets >= event.capacity,
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

/**
 * Create new event
 *
 * POST /api/events
 * Requirements: FR-13, FR-13.1 - Event creation with public/private settings
 */
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const data = req.body as CreateEventInput;

    // Validation
    if (!data.title || !data.dateTime || !data.location) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate invite token for private events
    const inviteToken = data.isPrivate ? randomBytes(16).toString('hex') : null;

    const event = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        dateTime: new Date(data.dateTime),
        location: data.location,
        price: data.price || 0,
        capacity: data.capacity || 100,
        isPrivate: data.isPrivate || false,
        inviteToken,
        imageUrl: data.imageUrl,
        organizerId: req.user!.id,
      },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

/**
 * Get events organized by current user
 *
 * GET /api/events/my-events
 * Requirement: FR-13 - Organizer event management
 */
router.get('/organizer/my-events', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      where: {
        organizerId: req.user!.id,
      },
      orderBy: {
        dateTime: 'desc',
      },
      include: {
        _count: {
          select: {
            tickets: {
              where: {
                status: {
                  in: ['REGISTERED', 'CHECKED_IN'],
                },
              },
            },
          },
        },
      },
    });

    const eventsWithStats = events.map((event: any) => ({
      ...event,
      ticketsSold: event._count.tickets,
      spotsAvailable: event.capacity - event._count.tickets,
    }));

    res.json(eventsWithStats);
  } catch (error) {
    console.error('Error fetching organizer events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

export default router;
