// Requirements: Demo data generation for testing and demonstration
// Purpose: Create sample users, events, and tickets for quick setup
// Links: See docs/requirements-traceability.md

// Use Prisma client from packages/database
const { PrismaClient } = require('../packages/database/node_modules/.prisma/client');
const bcrypt = require('bcrypt');
const path = require('path');
const { randomBytes } = require('crypto');

// Initialize Prisma with explicit database URL
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://gatekeeper:gatekeeper_dev_password@localhost:5432/gatekeeper_db'
    }
  }
});

async function main() {
  console.log('🌱 Seeding demo data...\n');

  // Create demo users
  console.log('Creating demo users...');

  const organizerPassword = await bcrypt.hash('password123', 10);
  const attendeePassword = await bcrypt.hash('password123', 10);

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@example.com' },
    update: {},
    create: {
      email: 'organizer@example.com',
      passwordHash: organizerPassword,
      fullName: 'Demo Organizer',
      role: 'ORGANIZER',
    },
  });

  const attendee = await prisma.user.upsert({
    where: { email: 'attendee@example.com' },
    update: {},
    create: {
      email: 'attendee@example.com',
      passwordHash: attendeePassword,
      fullName: 'Demo Attendee',
      role: 'ATTENDEE',
    },
  });

  console.log('✅ Users created');
  console.log(`   Organizer: organizer@example.com / password123`);
  console.log(`   Attendee: attendee@example.com / password123\n`);

  // Create demo events
  console.log('Creating demo events...');

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const nextMonth = new Date(now);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  // Event 1: Free public event (tomorrow)
  const event1 = await prisma.event.create({
    data: {
      title: 'Tech Meetup: Web Development Trends 2026',
      description: 'Join us for an evening of networking and learning about the latest web development trends. Free food and drinks!',
      dateTime: tomorrow,
      location: 'Innovation Hub, 123 Tech Street, San Francisco, CA',
      price: 0,
      capacity: 50,
      isPrivate: false,
      organizerId: organizer.id,
    },
  });

  // Event 2: Paid public event (next week)
  const event2 = await prisma.event.create({
    data: {
      title: 'AI & Machine Learning Workshop',
      description: 'Hands-on workshop covering modern ML techniques. Includes materials and certificate.',
      dateTime: nextWeek,
      location: 'DataCorp Conference Center, 456 Innovation Ave, SF',
      price: 49.99,
      capacity: 30,
      isPrivate: false,
      organizerId: organizer.id,
    },
  });

  // Event 3: Private event (next week)
  const inviteToken = randomBytes(16).toString('hex');
  const event3 = await prisma.event.create({
    data: {
      title: 'Company Team Building Event',
      description: 'Private team building activities and dinner. Invitation only.',
      dateTime: nextWeek,
      location: 'Bay Area Adventure Park',
      price: 0,
      capacity: 100,
      isPrivate: true,
      inviteToken,
      organizerId: organizer.id,
    },
  });

  // Event 4: Free public event (next month)
  const event4 = await prisma.event.create({
    data: {
      title: 'Open Source Contributor Summit',
      description: 'Meet fellow open source contributors and maintainers. Discuss best practices and collaboration.',
      dateTime: nextMonth,
      location: 'GitHub HQ, San Francisco',
      price: 0,
      capacity: 200,
      isPrivate: false,
      organizerId: organizer.id,
    },
  });

  console.log('✅ Events created');
  console.log(`   Event 1: ${event1.title}`);
  console.log(`   Event 2: ${event2.title}`);
  console.log(`   Event 3: ${event3.title} (Private - Token: ${inviteToken})`);
  console.log(`   Event 4: ${event4.title}\n`);

  // Create sample tickets for the free event
  console.log('Creating sample tickets...');

  // Only generate JWT for tickets if JWT service is available
  // In production, you'd import and use the JWT service here
  // For seed data, we'll create tickets without JWT initially

  const ticket1 = await prisma.ticket.create({
    data: {
      userId: attendee.id,
      eventId: event1.id,
      status: 'REGISTERED',
      // JWT token will be generated when user views ticket
    },
  });

  console.log('✅ Sample ticket created for demo attendee\n');

  console.log('📊 Database Summary:');
  console.log(`   Users: 2 (1 organizer, 1 attendee)`);
  console.log(`   Events: 4 (3 public, 1 private)`);
  console.log(`   Tickets: 1\n`);

  console.log('🎉 Demo data seeded successfully!\n');
  console.log('📝 Quick Start:');
  console.log('   1. Start the API: cd apps/api && npm run dev');
  console.log('   2. Start attendee app: cd apps/attendee-web && npm run dev');
  console.log('   3. Start scanner app: cd apps/scanner-web && npm run dev');
  console.log('   4. Login as organizer@example.com or attendee@example.com\n');

  console.log(`🔗 Private Event Invite Link:`);
  console.log(`   http://localhost:3000/events/private/${inviteToken}\n`);
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
