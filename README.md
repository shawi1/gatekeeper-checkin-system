# GateKeeper - Event Check-In System

A comprehensive event check-in system featuring QR code-based tickets, real-time validation, and attendance tracking. Built as a capstone project demonstrating full-stack development with security best practices.

## 🎯 Features

### Attendee Platform
- **Event Discovery**: Browse public events with capacity and pricing info
- **Private Events**: Access invite-only events via unique tokens
- **Registration**: Support for both free and paid events
- **QR Tickets**: JWT-based QR code tickets with anti-counterfeiting nonces
- **Status Tracking**: Real-time ticket status (Registered, Checked In, Waitlisted)

### Organizer Scanner
- **Camera Scanning**: Real-time QR code scanning with auto-detection
- **Multi-Step Validation**: Comprehensive security checks (JWT signature, event match, nonce verification)
- **Color-Coded Feedback**:
  - 🟢 Green: Valid ticket, successful check-in
  - 🟡 Yellow: Duplicate check-in attempt
  - 🔴 Red: Invalid or counterfeit ticket
- **Real-Time Dashboard**: Live attendance statistics and check-in rates
- **Duplicate Prevention**: Prevents ticket reuse and counterfeiting

## 🏗️ Technology Stack

- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15 with Prisma ORM
- **Frontend**: Next.js 14 (React) for both attendee and scanner apps
- **Security**: RS256 JWT signing with nonce-based anti-counterfeiting
- **QR Codes**: `qrcode` for generation, `jsqr` for client-side scanning
- **Payments**: Stripe integration (demo mode)
- **Monorepo**: Turborepo for efficient code sharing

## 📁 Project Structure

```
gatekeeper/
├── apps/
│   ├── api/                    # Backend API (Express + TypeScript)
│   ├── attendee-web/           # Attendee frontend (Next.js)
│   └── scanner-web/            # Scanner PWA (Next.js)
├── packages/
│   ├── database/               # Prisma schema, migrations, seed data
│   ├── shared-types/           # Shared TypeScript interfaces
│   ├── jwt-core/               # JWT signing/validation logic (RS256)
│   └── shared-utils/           # Shared utilities
├── scripts/
│   ├── generate-keypair.js     # RS256 key generation
│   └── seed-demo-data.js       # Sample events for testing
├── docs/
│   └── requirements-traceability.md  # Code-to-requirement mapping
└── docker-compose.yml          # Local PostgreSQL setup
```

## 🚀 Quick Start for Group Members

### Prerequisites

Before you begin, ensure you have installed:
- **Node.js 18+** and **npm 9+** - [Download here](https://nodejs.org/)
- **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)

**Check your versions:**
```bash
node --version  # Should be v18.x.x or higher
npm --version   # Should be 9.x.x or higher
docker --version
```

### 🏁 First Time Setup (One-Time Only)

Run these commands **in order** from the project root directory:

#### 1. Install Root Dependencies
```bash
npm install
```
This installs Turborepo and shared dependencies.

#### 2. Start PostgreSQL Database
```bash
docker-compose up -d
```
Starts PostgreSQL in the background. Verify it's running:
```bash
docker ps | grep postgres
# You should see "gatekeeper-postgres" running
```

#### 3. Generate Security Keys
```bash
npm run generate-keys
```
Creates RS256 keypair for JWT signing. You'll see a success message.

#### 4. Create Database Schema
```bash
cd packages/database
npx prisma generate
npx prisma migrate dev --name initial_schema
cd ../..
```
Creates all database tables.

#### 5. Seed Demo Data
```bash
npm run seed
```
Creates test accounts and sample events. You'll see:
- 2 demo users created
- 4 events created (3 public, 1 private)
- 1 sample ticket

#### 6. Install Frontend Dependencies

**For the API:**
```bash
cd apps/api
npm install
cd ../..
```

**For Attendee App:**
```bash
cd apps/attendee-web
npm install
cd ../..
```

**For Scanner App:**
```bash
cd apps/scanner-web
npm install
cd ../..
```

#### 7. Build Shared Packages
```bash
cd packages/jwt-core && npm run build && cd ../..
cd packages/shared-types && npm run build && cd ../..
```

### ▶️ Running the Applications

**Option 1: Run All Apps Together (Recommended)**

From the project root, open **3 separate terminal windows**:

**Terminal 1 - API Server:**
```bash
cd apps/api
npm run dev
```
Wait for: `🚀 GateKeeper API server running on port 3001`

**Terminal 2 - Attendee App:**
```bash
cd apps/attendee-web
npm run dev
```
Wait for: `Ready on http://localhost:3000`

**Terminal 3 - Scanner App:**
```bash
cd apps/scanner-web
npm run dev
```
Wait for: `Ready on http://localhost:3002`

**Option 2: Run with Turbo (Advanced)**
```bash
npm run dev
```
Runs all apps in parallel, but output is combined.

### 🌐 Access the Applications

Once all three apps are running:

- **Attendee App**: http://localhost:3000
- **Scanner App**: http://localhost:3002
- **API Health Check**: http://localhost:3001/health
- **Database Admin**: Run `npm run db:studio` for http://localhost:5555

## 👤 Demo Accounts

- **Organizer**: organizer@example.com / password123
- **Attendee**: attendee@example.com / password123

## 🎬 Live Demo Flow

1. **Browse Events** (Attendee App)
   - Open http://localhost:3000
   - View public events with capacity indicators

2. **Register for Event**
   - Click on a free event
   - Login as attendee@example.com
   - Complete registration

3. **View Ticket**
   - Navigate to "My Tickets"
   - View QR code and ticket details
   - Note the status: "REGISTERED"

4. **Scan Ticket** (Scanner App)
   - Open http://localhost:3002
   - Allow camera access
   - Point camera at QR code
   - See green "Welcome" feedback

5. **Duplicate Prevention**
   - Scan same QR code again
   - See yellow "Already Checked In" warning

6. **View Dashboard**
   - Navigate to event dashboard
   - View real-time statistics
   - See updated check-in count

## 🔐 Security Features

### JWT-Based Tickets (FR-03, NFR-03)
- **RS256 Signing**: 2048-bit RSA keypair for secure JWT signatures
- **Unique Nonces**: Each ticket has a cryptographic nonce to prevent counterfeiting
- **Nonce Rotation**: After check-in, nonces are rotated to prevent ticket reuse
- **No Expiration**: Tickets remain valid for the event duration

### Multi-Step Validation (FR-10, FR-11)
1. Verify JWT signature using public key
2. Validate event ID matches
3. Check nonce exists in database
4. Prevent duplicate check-ins
5. Verify ticket status
6. Atomically update and rotate nonce

### Anti-Counterfeiting (NFR-03)
- Screenshot attacks prevented by nonce rotation
- Database lookup ensures ticket authenticity
- Unique constraint prevents duplicate registrations

## 📊 Performance

- **Validation Latency**: < 1 second (NFR-01 requirement)
- **Database Indexing**: Optimized for fast nonce lookups
- **Concurrent Check-Ins**: Race condition safe with database constraints

## 🧪 Testing

### Manual Testing Checklist

**Event Discovery (FR-01)**
- [ ] Browse public events
- [ ] View event details
- [ ] Access private event with invite token

**Registration (FR-02)**
- [ ] Register for free event
- [ ] Register for paid event (mock Stripe)
- [ ] Prevent duplicate registration

**Tickets (FR-03, FR-04)**
- [ ] View ticket with QR code
- [ ] Verify JWT token format
- [ ] Check ticket status badge

**Scanner (FR-06, FR-07, FR-08)**
- [ ] Camera opens and detects QR codes
- [ ] Valid ticket shows green feedback
- [ ] Invalid ticket shows red feedback
- [ ] Duplicate shows yellow feedback

**Dashboard (FR-09)**
- [ ] View attendance statistics
- [ ] Check real-time updates
- [ ] Verify check-in rate calculation

**Duplicate Prevention (FR-10)**
- [ ] Scan same ticket twice
- [ ] Verify 409/yellow response
- [ ] Check database only has one check-in

## 📚 Requirements Traceability

See [docs/requirements-traceability.md](docs/requirements-traceability.md) for detailed mapping of functional requirements (FR-01 through FR-13) and non-functional requirements (NFR-01 through NFR-03) to implementation files.

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Development mode (all apps)
npm run dev

# Build all packages
npm run build

# Database operations
npm run db:migrate      # Run migrations
npm run db:generate     # Generate Prisma client
npm run db:studio       # Open Prisma Studio

# Utilities
npm run generate-keys   # Generate RS256 keypair
npm run seed           # Seed demo data

# Individual apps
cd apps/api && npm run dev
cd apps/attendee-web && npm run dev
cd apps/scanner-web && npm run dev
```

## 📝 Environment Variables

Key environment variables (see `.env.example` for full list):

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_PRIVATE_KEY_PATH`: Path to RS256 private key
- `JWT_PUBLIC_KEY_PATH`: Path to RS256 public key
- `PORT`: API server port (default: 3001)
- `CORS_ORIGIN`: Allowed CORS origins

## 🔧 Troubleshooting Common Issues

### ❌ "Cannot connect to database"

**Check if PostgreSQL is running:**
```bash
docker ps | grep postgres
```

**If not running, start it:**
```bash
docker-compose up -d
```

**If it still fails:**
```bash
# Stop and remove the container
docker-compose down

# Start fresh
docker-compose up -d

# Wait 10 seconds, then run migrations again
cd packages/database
npx prisma migrate dev
```

### ❌ "Port 3000/3001/3002 already in use"

**Find what's using the port:**
```bash
# On Mac/Linux
lsof -ti:3000  # Replace 3000 with the port number
kill -9 <PID>  # Kill the process

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Or use different ports:**
- API: Edit `apps/api/.env` and change `PORT=3001` to `PORT=3005`
- Attendee: Run `cd apps/attendee-web && npm run dev -- -p 3010`
- Scanner: Run `cd apps/scanner-web && npm run dev -- -p 3020`

### ❌ "Module not found" or "Cannot find package"

**Reinstall dependencies:**
```bash
# From project root
npm install

# Then for each app
cd apps/api && npm install && cd ../..
cd apps/attendee-web && npm install && cd ../..
cd apps/scanner-web && npm install && cd ../..
```

**Rebuild shared packages:**
```bash
cd packages/jwt-core && npm run build && cd ../..
cd packages/shared-types && npm run build && cd ../..
```

### ❌ "Prisma Client not initialized"

```bash
cd packages/database
npx prisma generate
cd ../..
```

### ❌ "Keys not found" error

```bash
# Regenerate JWT keys
npm run generate-keys

# Verify they exist
ls -la keys/
# You should see private.pem and public.pem
```

### ❌ Camera not working in Scanner app

1. **Use HTTPS or localhost** - Camera API requires secure context
2. **Grant camera permissions** - Check browser settings
3. **Use Chrome or Edge** - Best camera support
4. **Try different browser** - Firefox/Safari may have issues

### ❌ QR Code not displaying

1. Check that ticket has `jwtToken` in API response
2. Open browser console (F12) and check for errors
3. Verify `qrcode` package is installed:
   ```bash
   cd apps/attendee-web
   npm install qrcode @types/qrcode
   ```

### 🆘 Complete Reset (Nuclear Option)

If everything is broken, start fresh:

```bash
# 1. Stop all running apps (Ctrl+C in all terminals)

# 2. Stop and remove database
docker-compose down -v

# 3. Remove all node_modules
rm -rf node_modules
rm -rf apps/*/node_modules
rm -rf packages/*/node_modules

# 4. Remove generated files
rm -rf apps/*/.next
rm -rf packages/database/node_modules/.prisma

# 5. Start from scratch
npm install
docker-compose up -d
npm run generate-keys
cd packages/database && npx prisma generate && npx prisma migrate dev && cd ../..
npm run seed

# 6. Install frontend dependencies
cd apps/api && npm install && cd ../..
cd apps/attendee-web && npm install && cd ../..
cd apps/scanner-web && npm install && cd ../..

# 7. Run the apps
# Open 3 terminals and run each app individually
```

### 💡 Still Having Issues?

1. **Check Node version**: `node --version` (must be 18+)
2. **Check Docker**: `docker --version` and ensure Docker Desktop is running
3. **Check logs**: Look at terminal output for error messages
4. **Try incognito mode**: Browser extensions can interfere
5. **Restart computer**: Sometimes Docker needs a fresh start

## 🎓 Capstone Project Notes

This project demonstrates:

- **Full-Stack Development**: Backend API, database design, and multiple frontend applications
- **Security Best Practices**: JWT signing, nonce-based anti-counterfeiting, input validation
- **Real-Time Features**: Live dashboard updates, concurrent check-in handling
- **User Experience**: Color-coded feedback, mobile-responsive design, PWA capabilities
- **Code Quality**: TypeScript for type safety, comprehensive comments with requirement traceability
- **DevOps**: Docker for local development, monorepo architecture, automated setup scripts

## 📄 License

This is a capstone project for educational purposes.

## 👥 Contributors

- **[Your Name]** - Project Lead / Full-Stack Developer
- **[Team Member 2]** - Frontend Developer
- **[Team Member 3]** - Backend Developer
- **[Team Member 4]** - Database & Security

Capstone Project 2026

## 🤝 Contributing

This is a capstone project, but if you're a team member:

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add your feature"`
3. Push to the branch: `git push origin feature/your-feature-name`
4. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📧 Contact

For questions or issues, please open an issue on GitHub or contact the project lead.

---

**Built with ❤️ for Capstone 2026**
