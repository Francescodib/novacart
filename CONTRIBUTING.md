# Contributing to NovaCart

First off, thank you for considering contributing to NovaCart! 🎉

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Project Structure](#project-structure)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inspiring community for all. Please be respectful and constructive.

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, Node version, browser)
- **Error messages** and logs

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide detailed description** of the suggested enhancement
- **Explain why** this enhancement would be useful
- **List examples** of how it would work

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

## 🛠 Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Git

### Setup Steps

1. **Fork and clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/novacart.git
   cd novacart
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   npx prisma db push
   npx prisma generate
   npm run db:seed
   ```

5. **Start dev server**
   ```bash
   npm run dev
   ```

6. **Create a branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

## 🔄 Pull Request Process

1. **Update documentation** if you're changing APIs or adding features
2. **Follow coding standards** (see below)
3. **Test your changes** thoroughly
4. **Update CHANGELOG.md** with your changes
5. **Commit with clear messages**:
   ```
   feat: Add notification filtering by type
   fix: Resolve WebSocket reconnection issue
   docs: Update API documentation
   style: Format code with prettier
   refactor: Simplify notification store logic
   test: Add tests for useSocket hook
   ```

6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request** with:
   - Clear title describing the change
   - Description of what changed and why
   - Reference to related issues
   - Screenshots/GIFs for UI changes

### PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged

## 💻 Coding Standards

### TypeScript

- Use **TypeScript strict mode** (already configured)
- **Avoid `any` type** - use proper types
- **Export types** for public APIs
- Use **interface** for object shapes

```typescript
// Good
interface Notification {
  id: string;
  title: string;
  read: boolean;
}

// Avoid
const notification: any = { ... };
```

### React Components

- Use **functional components** with hooks
- Keep components **small and focused**
- Extract **reusable logic** into custom hooks
- Use **TypeScript** for props

```typescript
// Good
interface NotificationBellProps {
  count: number;
  onClick: () => void;
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button onClick={onClick}>
      🔔 {count}
    </button>
  );
}
```

### File Naming

- **React components**: PascalCase (`NotificationBell.tsx`)
- **Hooks**: camelCase with `use` prefix (`useSocket.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`Notification.ts`)

### Code Style

- Use **2 spaces** for indentation
- Use **semicolons**
- Use **double quotes** for strings
- Use **arrow functions** for callbacks
- Add **comments** for complex logic

### Imports

Order imports logically:
```typescript
// 1. External libraries
import { useState } from "react";
import { io } from "socket.io-client";

// 2. Internal absolute imports
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notification";

// 3. Relative imports
import { NotificationItem } from "./NotificationItem";
```

### State Management

- Use **Zustand** for global state
- Use **React hooks** for local state
- Keep state **minimal and normalized**

### API Routes

- Always **validate input** with Zod or similar
- Always **authenticate** requests
- Return **consistent JSON** responses
- Use proper **HTTP status codes**

```typescript
// Good
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  // ... rest of logic
}
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router
│   ├── api/         # API routes
│   └── (pages)/     # Page components
├── components/      # React components
├── hooks/           # Custom React hooks
├── lib/             # Utility libraries
├── store/           # State management (Zustand)
├── types/           # TypeScript types
└── generated/       # Generated code (Prisma)
```

### Adding New Features

1. **API changes**: Update `src/app/api/`
2. **UI components**: Add to `src/components/`
3. **Hooks**: Add to `src/hooks/`
4. **Types**: Update `src/types/`
5. **Database**: Update `prisma/schema.prisma`

## 🧪 Testing

Currently, the project relies on manual testing. Contributions to add:
- Unit tests (Jest + React Testing Library)
- Integration tests (Playwright)
- E2E tests

are highly appreciated!

### Manual Testing Checklist

Before submitting a PR, test:
- [ ] Login/logout flow
- [ ] Creating notifications
- [ ] Marking as read
- [ ] Deleting notifications
- [ ] Multi-tab synchronization
- [ ] WebSocket reconnection
- [ ] Mobile responsive design

## 📝 Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation
- Add examples for new APIs

## 🎨 UI/UX Guidelines

- Follow existing **Tailwind CSS** patterns
- Maintain **dark theme** consistency
- Ensure **responsive design** (mobile-first)
- Add **loading states** for async operations
- Show **error messages** clearly
- Use **toast notifications** for feedback

## 🐛 Debugging

Useful debug logs are already in place:
- WebSocket events in browser console
- JWT validation in server logs
- API request/response logs

Add more logs when needed, but remove them before committing.

## 📞 Getting Help

- Open an issue for questions
- Check existing issues and discussions
- Read the documentation thoroughly

## 🙏 Thank You!

Your contributions make NovaCart better for everyone. Every contribution, no matter how small, is valuable and appreciated!

---

**Happy Coding!** 🚀
