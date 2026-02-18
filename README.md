# GateKeeper - Event Check-In System

A full-stack event check-in system featuring QR code tickets, real-time validation, and attendance tracking. Built with Node.js, Express, Next.js, PostgreSQL, and TypeScript.

## Features

- Event discovery and registration (free and paid events)
- JWT-based QR code tickets with anti-counterfeiting
- Real-time QR code scanning with camera
- Multi-step validation with duplicate prevention
- Live attendance dashboard
- Color-coded feedback (green/yellow/red)
- Private event support with invite tokens

## Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Frontend**: Next.js 14 (React)
- **Security**: RS256 JWT signing
- **QR Codes**: qrcode, jsqr
- **Monorepo**: Turborepo

## Project Structure

```
gatekeeper/
├── apps/
│   ├── api/                  # Backend API
│   ├── attendee-web/         # Attendee frontend
│   └── scanner-web/          # Scanner PWA
├── packages/
│   ├── database/             # Prisma schema
│   ├── jwt-core/             # JWT service
│   └── shared-types/         # TypeScript types
└── scripts/                  # Setup scripts
```

## Prerequisites

- Node.js 18+
- npm 9+
- Docker Desktop

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker-compose up -d
```

### 3. Generate JWT Keys

```bash
npm run generate-keys
```

### 4. Setup Database

```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name initial_schema
cd ../..
```

### 5. Seed Demo Data

```bash
npm run seed
```

### 6. Install App Dependencies

```bash
cd apps/api && npm install && cd ../..
cd apps/attendee-web && npm install && cd ../..
cd apps/scanner-web && npm install && cd ../..
```

### 7. Run the Applications

Open 3 separate terminals:

**Terminal 1 - API:**
```bash
cd apps/api
npm run dev
```

**Terminal 2 - Attendee App:**
```bash
cd apps/attendee-web
npm run dev
```

**Terminal 3 - Scanner App:**
```bash
cd apps/scanner-web
npm run dev
```

## Access

- Attendee App: http://localhost:3000
- Scanner App: http://localhost:3002
- API: http://localhost:3001

## Demo Accounts

- Organizer: organizer@example.com / password123
- Attendee: attendee@example.com / password123

## Usage

1. Browse events at http://localhost:3000
2. Login with demo account
3. Register for an event
4. View your ticket with QR code
5. Open scanner at http://localhost:3002
6. Scan the QR code
7. View dashboard for statistics

## Troubleshooting

### Database Connection Issues

```bash
docker ps | grep postgres  # Check if running
docker-compose restart     # Restart if needed
```

### Port Conflicts

If ports are in use, edit the PORT in `.env` files or use different ports:

```bash
cd apps/attendee-web && npm run dev -- -p 3010
cd apps/scanner-web && npm run dev -- -p 3020
```

### Module Not Found

```bash
npm install
cd apps/api && npm install && cd ../..
cd apps/attendee-web && npm install && cd ../..
cd apps/scanner-web && npm install && cd ../..
```

### Prisma Client Issues

```bash
cd packages/database
npx prisma generate
```

### Complete Reset

```bash
docker-compose down -v
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
npm run generate-keys
cd packages/database && npx prisma migrate dev && cd ../..
npm run seed
```

## Development Commands

```bash
npm run dev              # Start all apps
npm run build            # Build all packages
npm run seed             # Seed demo data
npm run db:studio        # Open Prisma Studio
```

## Security Features

- RS256 JWT signing with 2048-bit keypair
- Unique nonce per ticket for anti-counterfeiting
- Nonce rotation after check-in
- Multi-step validation process
- Database-level duplicate prevention

## License

Educational/Capstone Project

## Contributors

Capstone Project 2026
