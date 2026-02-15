# Requirements Traceability Matrix

This document maps each functional requirement (FR) and non-functional requirement (NFR) to its implementation in the codebase.

## Functional Requirements

### FR-01: User Authentication and Event Discovery

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-01: User registration and login | `apps/api/src/routes/auth.ts:15-120` | Manual: Register new account, login |
| FR-01: Browse public events | `apps/api/src/routes/events.ts:15-65` | Manual: View events on homepage |
| FR-01: Event discovery UI | `apps/attendee-web/app/page.tsx:1-150` | Manual: Browse events grid |
| FR-01.1: Private event access | `apps/api/src/routes/events.ts:67-120` | Manual: Access via invite link |

**Code Comments:**
- `apps/api/src/routes/auth.ts`: "Requirement: FR-01 - User authentication and registration"
- `apps/attendee-web/app/page.tsx`: "Requirement: FR-01 - Public event discovery landing page"

### FR-02: Event Registration (Paid vs Free)

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-02: Register for events | `apps/api/src/routes/tickets.ts:20-95` | Manual: Register for free/paid event |
| FR-02: Payment processing | `apps/api/src/routes/tickets.ts:60-75` | Manual: Test Stripe integration |

**Code Comments:**
- `apps/api/src/routes/tickets.ts:20`: "FR-02: Register for paid vs free events"
- `packages/database/prisma/schema.prisma:110`: "FR-02: Paid vs free events"

### FR-03: JWT-Based QR Code Tickets

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-03: JWT generation | `packages/jwt-core/src/index.ts:60-80` | Unit test: Verify JWT format |
| FR-03: RS256 signing | `packages/jwt-core/src/index.ts:28-35` | Manual: Check keypair usage |
| FR-03: QR code display | `apps/attendee-web/app/tickets/[id]/page.tsx:50-70` | Manual: View ticket QR |

**Code Comments:**
- `packages/jwt-core/src/index.ts:1`: "Requirements: FR-03 - JWT-based QR codes with RS256 signing"
- `packages/database/prisma/schema.prisma:75`: "FR-03: JWT-based QR code"

### FR-04: Ticket Retrieval

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-04: Get user's tickets | `apps/api/src/routes/tickets.ts:98-120` | Manual: View "My Tickets" |
| FR-04: Get specific ticket | `apps/api/src/routes/tickets.ts:122-155` | Manual: View ticket details |
| FR-04: Display QR code | `apps/attendee-web/app/tickets/[id]/page.tsx:1-200` | Manual: QR displays correctly |

**Code Comments:**
- `apps/attendee-web/app/tickets/[id]/page.tsx:1`: "Requirements: FR-04 - Ticket display with QR code"

### FR-05: Status Tracking

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-05: Status enum | `packages/database/prisma/schema.prisma:95-100` | Check DB: Status values |
| FR-05: Status determination | `apps/api/src/routes/tickets.ts:40-50` | Manual: Register when at capacity |
| FR-05: Status badge UI | `apps/attendee-web/app/tickets/[id]/page.tsx:85-95` | Manual: View status colors |

**Code Comments:**
- `packages/database/prisma/schema.prisma:95`: "FR-05: Ticket status lifecycle"
- `apps/api/src/routes/tickets.ts:47`: "FR-05: Determine status based on capacity"

### FR-06: Camera Access

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-06: Camera permission | `apps/scanner-web/app/page.tsx:35-50` | Manual: Allow camera access |
| FR-06: Video stream | `apps/scanner-web/app/page.tsx:40-48` | Manual: Camera shows video |

**Code Comments:**
- `apps/scanner-web/app/page.tsx:38`: "Request camera access (FR-06)"

### FR-07: QR Code Validation

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-07: Continuous scanning | `apps/scanner-web/app/page.tsx:60-95` | Manual: QR auto-detected |
| FR-07: Backend validation | `apps/api/src/routes/scanner.ts:20-150` | Manual: Scan valid QR |
| FR-07: JWT verification | `packages/jwt-core/src/index.ts:82-100` | Unit test: Valid/invalid JWTs |

**Code Comments:**
- `apps/scanner-web/app/page.tsx:60`: "Requirement: FR-07 - Continuous QR code scanning"
- `apps/api/src/routes/scanner.ts:1`: "Requirements: FR-07, FR-08, FR-09, FR-10, FR-11..."

### FR-08: Color-Coded Feedback

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-08: Green success | `apps/scanner-web/app/page.tsx:130-145` | Manual: Scan valid ticket |
| FR-08: Yellow duplicate | `apps/api/src/routes/scanner.ts:85-98` | Manual: Scan same QR twice |
| FR-08: Red invalid | `apps/api/src/routes/scanner.ts:55-65` | Manual: Scan counterfeit QR |

**Code Comments:**
- `apps/api/src/routes/scanner.ts:95`: "FR-08: Green success feedback"
- `apps/scanner-web/app/page.tsx:180`: "FR-08: Color-coded validation feedback overlay"

### FR-09: Real-Time Statistics

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-09: Stats endpoint | `apps/api/src/routes/scanner.ts:152-200` | Manual: Check API response |
| FR-09: Dashboard UI | `apps/scanner-web/app/dashboard/[eventId]/page.tsx:1-230` | Manual: View dashboard |
| FR-09: Auto-refresh | `apps/scanner-web/app/dashboard/[eventId]/page.tsx:28-35` | Manual: Watch 5s updates |

**Code Comments:**
- `apps/scanner-web/app/dashboard/[eventId]/page.tsx:1`: "Requirement: FR-09 - Real-time attendance statistics"
- `apps/api/src/routes/scanner.ts:30`: "FR-09: Poll for updates every 5 seconds"

### FR-10: Duplicate Prevention

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-10: Unique constraint | `packages/database/prisma/schema.prisma:85-87` | Check DB: Constraint exists |
| FR-10: JWT verification | `apps/api/src/routes/scanner.ts:40-50` | Manual: Scan invalid JWT |
| FR-10: Duplicate check | `apps/api/src/routes/scanner.ts:75-95` | Manual: Scan same QR twice |
| FR-10: Nonce validation | `apps/api/src/routes/scanner.ts:60-72` | Manual: Counterfeit detection |

**Code Comments:**
- `packages/database/prisma/schema.prisma:86`: "FR-10: Prevent duplicate registrations"
- `apps/api/src/routes/scanner.ts:75`: "FR-10: Check if already checked in (duplicate prevention)"

### FR-11: Multi-Step Validation

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-11: 6-step process | `apps/api/src/routes/scanner.ts:20-125` | Code review: All steps present |
| FR-11: Event match | `apps/api/src/routes/scanner.ts:55-65` | Manual: Wrong event QR |

**Code Comments:**
- `apps/api/src/routes/scanner.ts:15`: "FR-11: Multi-step validation process"
- `apps/api/src/routes/scanner.ts:55`: "FR-11 - Check event match"

### FR-13: Event Creation

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| FR-13: Create event API | `apps/api/src/routes/events.ts:160-200` | Manual: Create public/private event |
| FR-13.1: Private event token | `apps/api/src/routes/events.ts:175-180` | Manual: Generate invite link |

**Code Comments:**
- `apps/api/src/routes/events.ts:165`: "Requirements: FR-13, FR-13.1 - Event creation with public/private settings"

## Non-Functional Requirements

### NFR-01: Performance (< 1 second validation)

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| NFR-01: Latency tracking | `apps/api/src/routes/scanner.ts:20, 115-120` | Log analysis: Check latencies |
| NFR-01: Database indexes | `packages/database/prisma/schema.prisma:88-89` | Query analysis: Index usage |

**Code Comments:**
- `apps/api/src/routes/scanner.ts:20`: "const startTime = Date.now();"
- `apps/api/src/routes/scanner.ts:115`: "NFR-01: Log latency for performance tracking"

**Verification Method:**
```bash
# Check scanner logs for latency
tail -f apps/api/logs | grep "Latency:"
```

### NFR-02: Concurrent Check-Ins

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| NFR-02: Atomic updates | `apps/api/src/routes/scanner.ts:100-110` | Load test: Concurrent scans |
| NFR-02: Database transactions | `packages/database/prisma/schema.prisma:85-87` | Manual: Race condition test |

**Code Comments:**
- `packages/database/prisma/schema.prisma:86`: "@@unique([userId, eventId])"

**Verification Method:**
- Simulate concurrent check-ins with same ticket
- Only one should succeed, others should get duplicate warning

### NFR-03: Anti-Counterfeiting (Nonce System)

| Requirement | Implementation | Verification |
|------------|---------------|--------------|
| NFR-03: Nonce generation | `packages/jwt-core/src/index.ts:40-48` | Unit test: Unique nonces |
| NFR-03: Nonce validation | `apps/api/src/routes/scanner.ts:60-72` | Manual: Screenshot attack |
| NFR-03: Nonce rotation | `apps/api/src/routes/scanner.ts:100-108` | Manual: Reuse prevention |

**Code Comments:**
- `packages/jwt-core/src/index.ts:1`: "Requirements: NFR-03 - Anti-counterfeiting with unique nonce system"
- `apps/api/src/routes/scanner.ts:100`: "NFR-03 - Atomically update status, check-in time, and rotate nonce"

**Verification Method:**
1. Generate ticket with QR code
2. Screenshot the QR code
3. Check in with original QR (success)
4. Try to check in with screenshot (should fail - nonce rotated)

## Test Coverage Summary

### Manual Test Scenarios

1. **End-to-End Flow**
   - Browse events → Register → View ticket → Scan → Dashboard
   - **Verifies:** FR-01, FR-02, FR-03, FR-04, FR-07, FR-08, FR-09

2. **Duplicate Prevention**
   - Scan same QR twice
   - **Verifies:** FR-10, NFR-03

3. **Invalid Tickets**
   - Scan wrong event QR
   - Scan expired JWT
   - Scan counterfeit QR
   - **Verifies:** FR-11, NFR-03

4. **Performance**
   - Measure validation latency
   - Concurrent check-ins
   - **Verifies:** NFR-01, NFR-02

5. **Private Events**
   - Create private event
   - Access via invite link
   - **Verifies:** FR-01.1, FR-13, FR-13.1

### Unit Tests (Future Implementation)

- `packages/jwt-core/src/__tests__/jwt.test.ts`
  - Test JWT generation
  - Test signature verification
  - Test nonce uniqueness

### Integration Tests (Future Implementation)

- `apps/api/src/__tests__/scanner.test.ts`
  - Test validation flow
  - Test duplicate prevention
  - Test concurrent check-ins

## Code Comment Convention

All implementation files follow this convention:

**File Header:**
```typescript
// Requirements: FR-XX, FR-YY, NFR-ZZ
// Purpose: Brief description
// Links: See docs/requirements-traceability.md section X.X.X
```

**Function Documentation:**
```typescript
/**
 * Function description
 *
 * Requirements:
 * - FR-XX: Specific requirement
 * - NFR-YY: Performance requirement
 *
 * @param foo - Description
 * @returns Description
 */
```

**Inline Comments:**
```typescript
// Requirement: FR-10 - Prevent duplicate check-ins
if (ticket.status === 'CHECKED_IN') {
  return res.status(409).json({ error: 'Already checked in' });
}
```

## Screenshots for Capstone Demo

Required screenshots (save in `docs/screenshots/`):

1. `01-event-discovery.png` - Event browsing grid (FR-01)
2. `02-event-details.png` - Event details page (FR-01)
3. `03-registration.png` - Registration form (FR-02)
4. `04-ticket-qr.png` - Ticket with QR code (FR-03, FR-04)
5. `05-scanner-camera.png` - Scanner camera view (FR-06)
6. `06-green-success.png` - Green validation feedback (FR-08)
7. `07-yellow-duplicate.png` - Yellow duplicate warning (FR-08)
8. `08-red-invalid.png` - Red invalid ticket (FR-08)
9. `09-dashboard.png` - Real-time statistics dashboard (FR-09)
10. `10-private-event.png` - Private event invite flow (FR-01.1, FR-13)

## Capstone Presentation Notes

### Key Features to Demonstrate

1. **Security (NFR-03)**
   - RS256 JWT signing with 2048-bit keys
   - Nonce-based anti-counterfeiting
   - Screenshot attack prevention via nonce rotation

2. **User Experience (FR-08)**
   - Color-coded feedback (green/yellow/red)
   - Real-time dashboard updates
   - Mobile-responsive design

3. **Performance (NFR-01)**
   - Sub-1 second validation
   - Optimized database queries
   - Concurrent check-in handling

4. **Code Quality**
   - Comprehensive requirement traceability
   - TypeScript for type safety
   - Monorepo architecture with shared packages

### Demo Script

1. **Setup** (1 min)
   - Show docker-compose running PostgreSQL
   - Show all 3 apps running in parallel

2. **Attendee Flow** (2 min)
   - Browse public events
   - Register for free event
   - View ticket with QR code

3. **Scanner Flow** (3 min)
   - Open scanner app
   - Scan valid QR → Green feedback
   - Scan same QR → Yellow duplicate warning
   - Show dashboard with updated stats

4. **Security Demo** (2 min)
   - Explain nonce system
   - Show database nonce rotation
   - Attempt screenshot attack (fails)

5. **Code Walkthrough** (2 min)
   - Show critical validation logic
   - Point out requirement comments
   - Reference traceability document

Total: 10 minutes

## Future Enhancements

1. **Testing**
   - Unit tests for JWT service
   - Integration tests for validation flow
   - Load tests for performance verification

2. **Features**
   - Email ticket delivery
   - SMS check-in notifications
   - Analytics dashboard for organizers

3. **Security**
   - Rate limiting on validation endpoint
   - HTTPS enforcement
   - IP-based fraud detection

4. **Performance**
   - Redis caching for event data
   - WebSocket for real-time dashboard
   - CDN for static assets
