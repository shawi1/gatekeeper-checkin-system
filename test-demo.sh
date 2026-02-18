#!/bin/bash

echo "Testing GateKeeper Setup..."
echo ""

# Test 1: Database
echo "1. Testing database connection..."
docker exec gatekeeper-postgres psql -U gatekeeper -d gatekeeper_db -c "SELECT COUNT(*) FROM users;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ Database is running and accessible"
else
    echo "   ✗ Database connection failed"
    exit 1
fi

# Test 2: JWT Keys
echo "2. Testing JWT keys..."
if [ -f "keys/private.pem" ] && [ -f "keys/public.pem" ]; then
    echo "   ✓ JWT keys exist"
else
    echo "   ✗ JWT keys missing"
    exit 1
fi

# Test 3: Dependencies
echo "3. Testing dependencies..."
if [ -d "apps/api/node_modules" ] && [ -d "apps/attendee-web/node_modules" ] && [ -d "apps/scanner-web/node_modules" ]; then
    echo "   ✓ All dependencies installed"
else
    echo "   ✗ Some dependencies missing"
    exit 1
fi

# Test 4: Demo data
echo "4. Testing demo data..."
USERS=$(docker exec gatekeeper-postgres psql -U gatekeeper -d gatekeeper_db -t -c "SELECT COUNT(*) FROM users;")
EVENTS=$(docker exec gatekeeper-postgres psql -U gatekeeper -d gatekeeper_db -t -c "SELECT COUNT(*) FROM events;")

if [ $USERS -ge 2 ] && [ $EVENTS -ge 4 ]; then
    echo "   ✓ Demo data seeded ($USERS users, $EVENTS events)"
else
    echo "   ✗ Demo data incomplete"
    exit 1
fi

echo ""
echo "All systems ready for demo! 🚀"
echo ""
echo "To start the apps:"
echo "  Terminal 1: cd apps/api && npm run dev"
echo "  Terminal 2: cd apps/attendee-web && npm run dev"
echo "  Terminal 3: cd apps/scanner-web && npm run dev"
echo ""
echo "Demo accounts:"
echo "  Organizer: organizer@example.com / password123"
echo "  Attendee: attendee@example.com / password123"
