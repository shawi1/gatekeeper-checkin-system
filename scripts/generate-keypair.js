// Requirements: FR-03, NFR-03 - RS256 keypair generation for JWT signing
// Purpose: Generate RSA keypair for secure ticket JWT signing
// Links: See docs/requirements-traceability.md section 3.1.3

const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

console.log(' Generating RS256 keypair for JWT ticket signing...\n');

// Generate 2048-bit RSA keypair
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

// Create keys directory if it doesn't exist
const keysDir = path.join(process.cwd(), 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir, { recursive: true });
}

// Write private key with restricted permissions
const privateKeyPath = path.join(keysDir, 'private.pem');
fs.writeFileSync(privateKeyPath, privateKey, { mode: 0o600 });

// Write public key
const publicKeyPath = path.join(keysDir, 'public.pem');
fs.writeFileSync(publicKeyPath, publicKey);

console.log(' Keypair generated successfully!');
console.log(`   Private key: ${privateKeyPath}`);
console.log(`   Public key: ${publicKeyPath}\n`);

console.log('WARNING:  SECURITY WARNING:');
console.log('   - NEVER commit private.pem to version control');
console.log('   - The keys/ directory is already in .gitignore');
console.log('   - Private key has restrictive permissions (600)\n');

console.log(' Next steps:');
console.log('   1. Copy .env.example to .env');
console.log('   2. Run: npm run db:migrate');
console.log('   3. Run: npm run seed');
console.log('   4. Run: npm run dev\n');
