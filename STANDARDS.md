# ====================================
# CLINIC PRO - STANDARDS & CODING GUIDE
# ====================================

## 1. PROJECT STRUCTURE

```
ClinicPRO-main/
├── frontend/                 # React Vite Application
│   ├── src/
│   │   ├── pages/           # Page components (role-based)
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API communication
│   │   ├── stores/          # State management
│   │   ├── types/           # TypeScript types
│   │   ├── utils/           # Helper functions
│   │   └── styles/          # CSS & Tailwind
│   ├── package.json
│   ├── vite.config.ts
│   ├── biome.json
│   └── tsconfig.json
│
├── backend/                  # Node.js Express API
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   │   ├── auth/        # Authentication module
│   │   │   ├── citas/       # Appointments module
│   │   │   ├── usuarios/    # Users module
│   │   │   └── pacientes/   # Patients module
│   │   ├── config/          # Configuration files
│   │   ├── middleware/      # Express middleware
│   │   ├── utils/           # Helper functions
│   │   ├── types/           # Shared types
│   │   ├── index.ts         # App factory
│   │   └── server.ts        # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── biome.json
│   └── Dockerfile
│
├── docker-compose.yml       # Docker orchestration
├── biome.json              # Root Biome config
├── .editorconfig           # Editor consistency
└── STANDARDS.md            # This file
```

---

## 2. CODE STYLE & FORMATTING

### 2.1 General Rules
- **Language:** TypeScript (strict mode)
- **Formatter:** Biome
- **Line Length:** 100 characters max
- **Indentation:** 2 spaces
- **Quotes:** Single quotes (')
- **Semicolons:** Always required
- **Trailing Commas:** ES5 style

### 2.2 Naming Conventions

| Element | Style | Example |
|---------|-------|---------|
| Files | `kebab-case` | `user-service.ts` |
| Directories | `kebab-case` | `src/modules/auth` |
| Components (React) | `PascalCase` | `UserProfile.tsx` |
| Functions/Variables | `camelCase` | `getUserById()` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRIES` |
| Interfaces | `PascalCase` with `I` prefix | `IUserDTO` |
| Types | `PascalCase` | `UserRole` |
| Enums | `PascalCase` | `CitaStatus` |
| Classes | `PascalCase` | `AuthService` |

### 2.3 TypeScript Strictness
- Enable `strict: true` in tsconfig.json
- No `any` type usage (use `unknown` if necessary)
- All function parameters must have types
- All return types must be explicit

```typescript
// ❌ Bad
function getUser(id) {
  return users[id];
}

// ✅ Good
function getUser(id: string): IUser | null {
  return users[id] || null;
}
```

### 2.4 Import Order
1. External libraries (`import express from 'express'`)
2. Internal modules (`import { authService } from '../services/auth.service'`)
3. Types (`import type { IUser } from '../types'`)
4. Relative imports (same folder)

```typescript
import 'reflect-metadata';
import express, { type Request, type Response } from 'express';
import { authService } from '../services/auth.service.js';
import type { IAuthPayload } from '../types/common.types.js';
```

---

## 3. BACKEND STANDARDS

### 3.1 Module Structure
Each module should follow this pattern:

```
modules/[feature]/
├── [feature].controller.ts     # Request handlers
├── [feature].service.ts        # Business logic
├── [feature].routes.ts         # Route definitions
├── [feature].types.ts          # Feature-specific types
├── [feature].schemas.ts        # Validation schemas (Zod)
└── index.ts                    # Public exports
```

### 3.2 File Size Limits
- **Controllers:** Max 200 lines
- **Services:** Max 300 lines
- **Routes:** Max 150 lines
- **Functions:** Max 50 lines

If exceeded, split into smaller modules.

### 3.3 Error Handling

```typescript
// ✅ Consistent error response format
interface IApiError {
  success: false;
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
  timestamp: Date;
}

// Example usage
res.status(400).json({
  success: false,
  error: {
    code: 'INVALID_EMAIL',
    message: 'Email format is invalid',
    statusCode: 400,
  },
  timestamp: new Date(),
});
```

### 3.4 Service Layer Pattern

```typescript
// auth.service.ts
export class AuthService {
  async login(email: string, password: string): Promise<ILoginResponse> {
    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Business logic
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Return result
    return { token, user };
  }
}
```

---

## 4. FRONTEND STANDARDS

### 4.1 Component Structure

```typescript
// UserCard.tsx
import { type ReactNode } from 'react';
import type { IUser } from '@/types/user.types';

interface IUserCardProps {
  user: IUser;
  onAction?: () => void;
  children?: ReactNode;
}

export function UserCard({ user, onAction, children }: IUserCardProps) {
  return (
    <div className="card">
      <h3>{user.first_name}</h3>
      {children}
    </div>
  );
}
```

### 4.2 Hook Conventions

- Use `use` prefix: `useAuth`, `useForm`, `useFetch`
- Keep hooks small and focused
- Extract complex logic into custom hooks

```typescript
// useAuth.ts
export function useAuth() {
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      setUser(response.user);
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, login };
}
```

### 4.3 Form Validation
- Use React Hook Form + Zod
- Define schemas separately

```typescript
// user.schemas.ts
import { z } from 'zod';

export const userFormSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  first_name: z.string().min(2, 'Required'),
});

export type IUserFormData = z.infer<typeof userFormSchema>;
```

---

## 5. GIT WORKFLOW

### 5.1 Branch Strategy (GitHub Flow)
- `main` - Production code (tested, ready to deploy)
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes

### 5.2 Commit Message Format
```
[TYPE]: Brief description

More detailed explanation if needed.

Fixes #123 (if closing an issue)
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `docs:` Documentation
- `style:` Code formatting
- `test:` Test additions

**Example:**
```
feat: Add user authentication module

Implement JWT-based auth with bcryptjs password hashing.
Added login and register endpoints.

Fixes #45
```

### 5.3 Pre-Commit Hooks
Husky will automatically:
1. Run Biome format check
2. Run TypeScript type checking
3. Run ESLint rules
4. Validate commit messages

Commit will be rejected if any check fails.

---

## 6. TESTING STANDARDS

### 6.1 Test File Location
```
src/
├── services/
│   ├── user.service.ts
│   └── user.service.test.ts
```

### 6.2 Test Coverage Goals
- Services: 80%+ coverage
- Controllers: 60%+ coverage
- Utils: 100% coverage

### 6.3 Test Format
```typescript
describe('AuthService', () => {
  describe('login', () => {
    it('should return token for valid credentials', async () => {
      const result = await authService.login('user@example.com', 'password123');
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(
        authService.login('invalid', 'password'),
      ).rejects.toThrow('Email format is invalid');
    });
  });
});
```

---

## 7. DATABASE STANDARDS

### 7.1 Connection Options

#### Option A: Docker PostgreSQL (Recommended for Development)
```bash
docker-compose up -d
# Database available at localhost:5432
```

#### Option B: Supabase (Production)
```bash
# Set SUPABASE_URL and SUPABASE_KEY in .env
```

### 7.2 Migration Strategy
- Use TypeORM migrations for schema changes
- Version control all migrations
- Never modify deployed migrations

```bash
npm run migration:generate -- -n AddUserTable
npm run migration:run
```

---

## 8. ENVIRONMENT VARIABLES

### Required Variables
```env
# Server
NODE_ENV=development
BACKEND_PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Database (Docker)
DB_USER=clinicpro_user
DB_PASSWORD=secure_password
DB_NAME=clinicpro_db
DATABASE_URL=postgresql://...

# Frontend
VITE_API_BASE_URL=http://localhost:3000
```

Never commit `.env` files. Use `.env.example` as template.

---

## 9. CODE REVIEW CHECKLIST

Before submitting a PR, verify:
- [ ] Code passes `npm run lint`
- [ ] Code passes `npm run format:check`
- [ ] TypeScript has no errors
- [ ] Tests pass and coverage meets goals
- [ ] No `console.log` statements (use proper logging)
- [ ] No hardcoded secrets or credentials
- [ ] PR description explains the changes
- [ ] Commits follow message format

---

## 10. USEFUL COMMANDS

```bash
# Linting and Formatting
npm run lint              # Check for issues
npm run format            # Auto-format code
npm run format:check      # Check if formatted

# Type Checking
npm run type:check        # TypeScript type validation

# Database
npm run db:migrate        # Run migrations
npm run db:seed           # Seed development data

# Docker
docker-compose up -d      # Start all services
docker-compose down       # Stop all services

# Development
npm run dev               # Start dev server with hot reload
npm run build             # Build for production
npm run start             # Run production build
```

---

## 11. COMMON PATTERNS

### 11.1 Async Error Handling
```typescript
// ❌ Avoid try-catch in route handlers
app.post('/auth/login', (req, res) => {
  try {
    const result = await authService.login(email, password);
  } catch (error) {
    // Error handling scattered
  }
});

// ✅ Use error middleware
app.post('/auth/login', asyncHandler(async (req, res) => {
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}));
```

### 11.2 API Response Wrapper
```typescript
interface IApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
}

// Consistent responses
res.json({
  success: true,
  data: user,
  timestamp: new Date(),
});
```

---

## 12. TROUBLESHOOTING

### Issue: Biome format issues
```bash
npm run format  # Auto-fix formatting
```

### Issue: TypeScript errors
```bash
npm run type:check  # Check all type errors
```

### Issue: Pre-commit hook fails
```bash
# Commit anyway (not recommended)
git commit --no-verify

# Or fix issues and try again
```

---

**Last Updated:** April 24, 2026  
**Maintainer:** Yuvinca Nina Urquiola  
**Repository:** yumiNina97/ClinicPRO
