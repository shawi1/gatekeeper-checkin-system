# Contributing to GateKeeper

Thank you for contributing to the GateKeeper Event Check-In System! This guide will help you get started.

## 🚦 Getting Started

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd gatekeeper
   ```

2. **Follow the setup instructions** in [README.md](README.md)

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🌿 Branch Naming Convention

Use descriptive branch names with prefixes:

- `feature/` - New features (e.g., `feature/add-email-notifications`)
- `fix/` - Bug fixes (e.g., `fix/scanner-camera-permission`)
- `docs/` - Documentation updates (e.g., `docs/update-setup-guide`)
- `refactor/` - Code refactoring (e.g., `refactor/validation-logic`)
- `test/` - Adding tests (e.g., `test/jwt-validation`)

## 📝 Commit Message Guidelines

Write clear, descriptive commit messages:

**Good:**
```
Add email notification for ticket registration

- Implement email service using SendGrid
- Add email templates for confirmation
- Update registration endpoint to send emails
```

**Bad:**
```
updates
fix stuff
changes
```

**Format:**
```
<type>: <subject>

<optional body>

<optional footer>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, missing semicolons, etc.
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

## 🔍 Code Review Process

1. **Create a Pull Request** to the `main` branch
2. **Link related issues** in the PR description
3. **Request review** from at least one team member
4. **Address feedback** promptly
5. **Ensure CI passes** (if we add CI/CD later)
6. **Merge** once approved

## 📋 Pull Request Template

When creating a PR, include:

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] Checked all affected features

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

## 🧪 Testing Your Changes

Before submitting a PR:

1. **Test locally**
   ```bash
   # Start all apps
   npm run dev
   ```

2. **Test the complete flow**
   - Register for an event
   - View ticket with QR code
   - Scan the ticket
   - Check dashboard updates

3. **Check for errors**
   - Look at browser console (F12)
   - Check API terminal for errors
   - Verify database changes in Prisma Studio

4. **Test edge cases**
   - Invalid inputs
   - Duplicate actions
   - Network errors

## 📦 Adding Dependencies

If you need to add a new npm package:

1. **Install in the correct location**
   - Backend: `cd apps/api && npm install <package>`
   - Attendee: `cd apps/attendee-web && npm install <package>`
   - Scanner: `cd apps/scanner-web && npm install <package>`
   - Shared: `cd packages/<package-name> && npm install <package>`

2. **Document why** in your PR description

3. **Check package size** - Avoid large dependencies

## 🎨 Code Style

### TypeScript
- Use TypeScript for all new code
- Define types for function parameters and returns
- Avoid `any` type when possible

### Naming Conventions
- **Files**: kebab-case (e.g., `user-service.ts`)
- **Components**: PascalCase (e.g., `EventCard.tsx`)
- **Functions**: camelCase (e.g., `validateTicket`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_CAPACITY`)

### Comments
- Add requirement references for key features
  ```typescript
  // Requirement: FR-10 - Prevent duplicate check-ins
  if (ticket.status === 'CHECKED_IN') {
    return res.status(409).json({ error: 'Already checked in' });
  }
  ```

### File Headers
Include requirement references at the top of important files:
```typescript
// Requirements: FR-07, FR-08, FR-10
// Purpose: Scanner validation with color-coded feedback
// Links: See docs/requirements-traceability.md
```

## 🗂️ Project Structure

When adding new features, follow the existing structure:

```
apps/api/src/
├── routes/          # API endpoints
├── middleware/      # Express middleware
├── services/        # Business logic
└── utils/           # Helper functions

apps/attendee-web/app/
├── (pages)          # Next.js pages
├── components/      # React components
└── lib/             # Utilities

apps/scanner-web/app/
├── (pages)          # Next.js pages
├── components/      # React components
└── lib/             # Utilities

packages/
├── database/        # Prisma schema and migrations
├── jwt-core/        # JWT service
├── shared-types/    # TypeScript interfaces
└── shared-utils/    # Shared utilities
```

## 🔒 Security Guidelines

- **Never commit secrets** - Use `.env` files
- **Never commit private keys** - Already in `.gitignore`
- **Validate all inputs** - Use Zod or similar
- **Sanitize user data** - Prevent XSS and SQL injection
- **Use HTTPS** in production
- **Follow JWT best practices** - Already implemented

## 🐛 Reporting Bugs

1. **Check existing issues** first
2. **Create a new issue** with:
   - Clear title
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Screenshots (if applicable)
   - Environment (OS, Node version, browser)

## 💡 Suggesting Features

1. **Check existing issues** and discussions
2. **Open an issue** with:
   - Clear description of the feature
   - Use cases and benefits
   - Proposed implementation (optional)
   - Mockups or examples (if applicable)

## 🚀 Deployment (Future)

When we're ready to deploy:

- [ ] Set up CI/CD pipeline
- [ ] Configure production environment variables
- [ ] Set up production database
- [ ] Configure domain and SSL
- [ ] Set up monitoring and logging

## 📚 Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## ❓ Questions?

If you have questions:
1. Check the [README.md](README.md) troubleshooting section
2. Ask in team chat
3. Open a GitHub discussion
4. Contact the project lead

---

Thank you for contributing! 🎉
