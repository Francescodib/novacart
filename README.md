# 🛒 NovaCart - Real-Time Notification System

> A modern e-commerce platform with real-time notifications built with Next.js 15, Socket.io, and NextAuth v5.

[![Next.js](https://img.shields.io/badge/Next.js-15.5.5-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-green)](https://socket.io/)
[![Prisma](https://img.shields.io/badge/Prisma-6.17-blueviolet)](https://www.prisma.io/)

## 📋 Table of Contents

- [Overview](#overview)
- [Screenshots](#screenshots)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

NovaCart is a full-stack e-commerce platform that implements a sophisticated real-time notification system. Users receive instant updates about order status, promotions, price drops, and stock alerts without page refresh, enhancing customer engagement and satisfaction.

### Key Highlights

- **Real-time WebSocket communication** with Socket.io
- **Secure JWT authentication** with NextAuth v5
- **Multi-tab synchronization** - notifications sync across browser tabs
- **Type-safe** with TypeScript strict mode
- **Modern UI** with Tailwind CSS 4 and React 19
- **Production-ready** security with JWT validation

## 📸 Screenshots

### Login Page
![Login Page](.github/assets/01-login-page.png)
*Secure authentication with NextAuth v5 - Clean, modern login interface*

### Dashboard with Toast Notification
![Dashboard with Toast](.github/assets/02-dashboard-with-toast.png)
*Real-time toast popup appears instantly when new notification arrives*

### Notification Center
![Notification Center](.github/assets/03-notification-center-scroll.png)
*Dropdown notification center with filters, mark as read, and delete actions*

### Test Page
![Test Page](.github/assets/04-test-page.png)
*Developer-friendly test interface for creating and managing notifications*

## ✨ Features

### 🔔 Real-Time Notifications

- Instant delivery via WebSocket (no polling required)
- 11 notification types: orders, promotions, price drops, stock alerts, etc.
- Toast popups with smooth animations
- Badge counter with shake animation
- Mark as read/unread functionality
- Bulk operations (mark all as read, delete)

### 🔐 Authentication & Security

- NextAuth v5 with credentials provider
- JWT token generation and validation
- Cryptographic signature verification
- Token expiration handling (30 days)
- User-specific room isolation in WebSocket
- Ownership checks on all operations

### 📱 User Interface

- **Notification Bell** - Badge with unread count
- **Notification Center** - Dropdown with filters and actions
- **Toast Notifications** - Non-invasive popup alerts
- **Responsive Design** - Works on mobile and desktop
- **Dark Theme** - Modern, polished UI

### 🚀 Performance

- Connection pooling for WebSocket
- Database indexes on critical fields
- Singleton pattern for client connections
- Optimized queries with pagination
- Next.js 15 Turbopack for fast builds

## 🛠 Tech Stack

### Frontend
- **Next.js 15.5.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript 5** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **Socket.io Client** - WebSocket client
- **react-hot-toast** - Toast notifications
- **Headless UI** - Accessible components

### Backend
- **Next.js API Routes** - RESTful API
- **Socket.io** - WebSocket server
- **NextAuth v5** - Authentication
- **Prisma** - ORM
- **PostgreSQL** - Database (via Prisma Postgres)
- **jsonwebtoken** - JWT handling
- **bcrypt** - Password hashing

### Development Tools
- **tsx** - TypeScript execution
- **ESLint** - Code linting
- **Prettier** - Code formatting (recommended)

## 🏗 Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Browser Client                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Dashboard   │  │  Test Page   │  │  Auth Pages  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                  │                  │          │
│    ┌────┴──────────────────┴──────────────────┴────┐    │
│    │           Custom Hooks Layer                   │    │
│    │  useSocket()  │  useNotifications()            │    │
│    └────┬──────────────────┬───────────────────────┘    │
│         │                  │                             │
│    ┌────┴────────┐    ┌────┴────────┐                   │
│    │  Socket.io  │    │   Zustand   │                   │
│    │   Client    │    │    Store    │                   │
│    └────┬────────┘    └─────────────┘                   │
└─────────┼───────────────────────────────────────────────┘
          │
          │ WebSocket (JWT Auth)
          │
┌─────────┼───────────────────────────────────────────────┐
│         │              Next.js Server                    │
│    ┌────┴────────┐                                       │
│    │  Socket.io  │         ┌─────────────────┐          │
│    │   Server    │◄────────┤  Custom Server  │          │
│    └────┬────────┘         │   (server.ts)   │          │
│         │                  └─────────────────┘          │
│         │                                                │
│    ┌────┴──────────────────────────────────────┐        │
│    │           API Routes (REST)               │        │
│    │  /api/notifications                        │        │
│    │  /api/notifications/[id]                   │        │
│    │  /api/notifications/[id]/mark-read         │        │
│    │  /api/notifications/mark-all-read          │        │
│    │  /api/auth/[...nextauth]                   │        │
│    └────┬──────────────────────────────────────┘        │
│         │                                                │
│    ┌────┴────────┐                                       │
│    │  NextAuth   │                                       │
│    │  (JWT Auth) │                                       │
│    └────┬────────┘                                       │
│         │                                                │
│    ┌────┴────────┐                                       │
│    │   Prisma    │                                       │
│    │     ORM     │                                       │
│    └────┬────────┘                                       │
└─────────┼───────────────────────────────────────────────┘
          │
          │ SQL
          │
┌─────────┼───────────────────────────────────────────────┐
│    ┌────┴────────┐                                       │
│    │ PostgreSQL  │                                       │
│    │  Database   │                                       │
│    └─────────────┘                                       │
└───────────────────────────────────────────────────────────┘
```

### Data Flow

**1. New Notification Created:**
```
Client → POST /api/notifications → Prisma → PostgreSQL
                ↓
         Socket.io emit → All user's tabs → Update Zustand → UI refresh + Toast
```

**2. Mark as Read:**
```
Client → PUT /api/notifications/[id]/mark-read → Prisma → PostgreSQL
                ↓
         Socket.io emit → All user's tabs → Update Zustand → UI refresh
```

**3. WebSocket Connection:**
```
Client login → NextAuth JWT → useSocket hook → Socket.io connect with JWT
                ↓
         Server validates JWT → Join user room → Send initial notifications
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and **npm** - [Download here](https://nodejs.org/)
- **PostgreSQL** database - [Installation guide](https://www.postgresql.org/download/) or use [Prisma Postgres](https://www.prisma.io/postgres)
- **Git** - [Download here](https://git-scm.com/)

### Quick Start (5 minutes)

Follow these steps **in order** to get NovaCart running locally:

#### Step 1: Clone the Repository

```bash
git clone https://github.com/Francescodib/novacart
cd novacart
```

#### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, Socket.io, Prisma, and more.

#### Step 3: Set Up Environment Variables

Create a `.env` file in the root directory by copying the example:

```bash
cp .env.example .env
```

Then edit `.env` and configure:

```env
# Database - Choose ONE option:

# Option A: Prisma Postgres (Easiest - Managed by Prisma)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"

# Option B: Local PostgreSQL
# DATABASE_URL="postgresql://postgres:password@localhost:5432/novacart"

# NextAuth - Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate a secure secret:**
```bash
openssl rand -base64 32
```
Copy the output and paste it as `NEXTAUTH_SECRET` in your `.env` file.

#### Step 4: Set Up the Database

Run these commands **in order**:

```bash
# 1. Push the schema to your database
npx prisma db push

# 2. Generate Prisma Client
npx prisma generate

# 3. Seed test data (creates test user + sample notifications)
npm run db:seed
```

**✅ Database seeding complete!** You now have:
- Test user: `test@novacart.com` / `password123`
- 3 sample notifications

#### Step 5: Start the Development Server

```bash
npm run dev
```

Wait for the server to start. You should see:
```
✓ Ready in Xms
🔌 Socket.io server listening on port 3000
```

#### Step 6: Open the Application

1. Open your browser and navigate to: **[http://localhost:3000/auth/login](http://localhost:3000/auth/login)**

2. **Login** with test credentials:
   - Email: `test@novacart.com`
   - Password: `password123`

3. You'll be redirected to the **Dashboard** where you can see your notifications!

### 🎯 Next Steps - Explore the Features

#### Test Real-Time Notifications

1. **Go to the Test Page**: [http://localhost:3000/test-socket](http://localhost:3000/test-socket)
2. Click **"📦 Crea Notifica Ordine"** to create a test notification
3. Watch the **toast popup** appear instantly
4. See the **notification bell badge** update in real-time

#### Test Multi-Tab Synchronization

1. **Open the dashboard in TWO browser tabs** side-by-side
2. In one tab, click the **notification bell** and **mark a notification as read**
3. Watch it **automatically update** in the other tab - no refresh needed!

#### Explore the UI

- **Notification Bell** (top right) - Click to open notification center
- **Notification Center** - Filter by "All" or "Unread"
- **Toast Notifications** - Automatic popups for new notifications
- **User Menu** (avatar) - Logout and see session handling

### 🔧 Troubleshooting

**Database connection error?**
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` in `.env` is correct
- If using Prisma Postgres, verify your API key

**Port 3000 already in use?**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

**JWT validation errors in console?**
- Ensure you've **logged out and logged in again** after changing `NEXTAUTH_SECRET`
- Old sessions have invalid tokens

**WebSocket not connecting?**
- Check console for errors
- Verify `NEXT_PUBLIC_APP_URL` matches your development URL
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+R)

## 📁 Project Structure

```
novacart/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Database seeding script
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   └── notifications/# Notification CRUD endpoints
│   │   ├── auth/             # Auth pages (login)
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── test-socket/      # Test page for notifications
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # React components
│   │   └── notifications/    # Notification UI components
│   │       ├── NotificationBell.tsx
│   │       ├── NotificationCenter.tsx
│   │       ├── NotificationItem.tsx
│   │       └── NotificationToastProvider.tsx
│   ├── hooks/                # Custom React hooks
│   │   ├── useSocket.ts      # WebSocket management
│   │   └── useNotifications.ts
│   ├── lib/                  # Utility libraries
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Prisma client
│   │   ├── socket.ts         # Socket.io client
│   │   └── socket-server.ts  # Socket.io server utilities
│   ├── store/                # State management
│   │   └── notificationStore.ts # Zustand store
│   ├── types/                # TypeScript types
│   │   ├── notification.ts   # Notification types
│   │   └── next-auth.d.ts    # NextAuth type extensions
│   └── generated/            # Generated Prisma Client
├── server.ts                 # Custom Next.js server with Socket.io
├── socket-handler.ts         # WebSocket event handlers
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 📡 API Documentation

### Authentication

All API routes require authentication via NextAuth session.

**Headers:**
```
Cookie: next-auth.session-token=...
```

### Endpoints

#### `GET /api/notifications`
Get all notifications for the authenticated user.

**Response:**
```json
{
  "notifications": [
    {
      "id": "cm...",
      "userId": "cm...",
      "type": "ORDER_SHIPPED",
      "title": "Order Shipped",
      "message": "Your order #12345 has been shipped!",
      "read": false,
      "actionUrl": "/orders/12345",
      "metadata": null,
      "createdAt": "2025-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/notifications`
Create a new notification.

**Body:**
```json
{
  "userId": "cm...",
  "type": "PROMOTION",
  "title": "Special Offer",
  "message": "20% off all products!",
  "actionUrl": "/promotions"
}
```

**Response:**
```json
{
  "message": "Notifica creata con successo",
  "notification": { ... }
}
```

#### `GET /api/notifications/[id]`
Get a specific notification by ID.

#### `DELETE /api/notifications/[id]`
Delete a notification (only if owned by user).

#### `PUT /api/notifications/[id]/mark-read`
Mark a notification as read.

#### `PUT /api/notifications/mark-all-read`
Mark all user's notifications as read.

### WebSocket Events

**Client → Server:**
- `notifications:fetch` - Request all notifications
- `notification:mark-read` - Mark notification as read

**Server → Client:**
- `notifications:initial` - Initial notification list on connect
- `notification:new` - New notification created
- `notification:updated` - Notification updated (e.g., marked as read)
- `notification:deleted` - Notification deleted
- `notifications:all-read` - All notifications marked as read

## 🔐 Security

### Authentication Flow

1. User logs in via credentials
2. NextAuth validates password with bcrypt
3. JWT token generated with:
   - `userId` and `email` in payload
   - HMAC signature with `NEXTAUTH_SECRET`
   - 30-day expiration
4. Token stored in session
5. Token passed to WebSocket on connection
6. Server validates JWT signature and expiration
7. Server verifies `userId` in token matches requested user

### Security Features

- ✅ **JWT Authentication** - Cryptographic token validation
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **Ownership Checks** - Users can only access their own data
- ✅ **Room Isolation** - WebSocket rooms per user
- ✅ **Token Expiration** - Automatic session timeout
- ✅ **CSRF Protection** - NextAuth built-in protection
- ✅ **Type Safety** - TypeScript prevents common errors

### Environment Variables

**Required for production:**
- `NEXTAUTH_SECRET` - Strong random string (min 32 chars)
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - Your production domain

## 🧪 Testing

### Manual Testing

1. **Test Real-time Notifications:**
   - Login and go to `/test-socket`
   - Click "Create Notification"
   - See toast popup and bell badge update

2. **Test Multi-tab Sync:**
   - Open dashboard in two browser tabs
   - Mark notification as read in one tab
   - See it update in the other tab

3. **Test Security:**
   - Try accessing `/api/notifications` without login → 401
   - Try accessing another user's notification → 403

### Test User

The seed script creates:
- **Email:** test@novacart.com
- **Password:** password123
- 3 sample notifications

Run `npm run db:seed` to recreate.

## 🚀 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. **Set up Database**
   - Use Vercel Postgres or external PostgreSQL
   - Run migrations: `npx prisma db push`

### Docker (Alternative)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t novacart .
docker run -p 3000:3000 --env-file .env novacart
```

## 📝 Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_URL` | Application URL | `https://novacart.com` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | Public app URL for client | `https://novacart.com` |
| `NODE_ENV` | Environment | `production` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow existing code patterns
- Add comments for complex logic
- Update README for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Francesco Di Biase**

- GitHub: [@Francescodib](https://github.com/Francescodib)
- LinkedIn: [francescodibiase79](https://www.linkedin.com/in/francescodibiase79/)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Socket.io for real-time capabilities
- NextAuth.js for authentication
- Prisma for the excellent ORM
- Tailwind CSS for the styling system

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.io Documentation](https://socket.io/docs)
- [NextAuth Documentation](https://authjs.dev)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ using Next.js, Socket.io, and TypeScript**
