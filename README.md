# Aragón Startups Directory

Directorio oficial del ecosistema de startups de Aragón. Conecta emprendedores, inversores y el ecosistema innovador.

## 🎯 Estado del Proyecto

**Fase Actual**: Phase 1 - Authentication & Core Infrastructure ✅ **COMPLETADO**

### ✅ Implementado
- Sistema completo de autenticación (registro, login, recuperación de contraseña)
- Protección de rutas con middleware
- Roles de usuario (emprendedor, inversor, admin)
- Dashboard de usuario con navegación
- UI components con shadcn/ui
- Validación de formularios con Zod
- TypeScript types completos

### ⏳ Pendiente
- Configuración de credenciales de Supabase
- Creación del schema de base de datos
- Testing de flujos de autenticación

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm 9+
- Cuenta de Supabase

### Installation

```bash
# Install dependencies
pnpm install

# Configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

### Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Get your credentials from Project Settings → API
3. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

4. Open Supabase SQL Editor
5. Run the SQL from `docs/DATABASE_SCHEMA.md`

### Development

```bash
# Run development server
pnpm dev

# Open browser at http://localhost:3000
```

### Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## 📁 Project Structure

```
aragon-startups/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages (future)
│   ├── dashboard/         # User dashboard
│   ├── admin/             # Admin panel (future)
│   └── api/               # API routes (future)
├── components/            # React components
│   ├── layout/           # Layout components
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components (future)
│   └── startups/         # Startup components (future)
├── lib/                   # Utility libraries
│   ├── auth/             # Auth helpers and context
│   ├── supabase/         # Supabase clients
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
├── types/                 # TypeScript types
├── docs/                  # Documentation
└── public/               # Static assets
```

## 🔒 Authentication Flow

### User Registration
1. User selects role (entrepreneur/investor)
2. Fills registration form with validation
3. Receives email verification
4. Confirms email and logs in

### User Login
1. Email and password authentication
2. Session creation with Supabase Auth
3. Redirect to dashboard
4. Session persists across page loads

### Password Reset
1. User requests password reset
2. Receives email with reset link
3. Sets new password
4. Can log in with new credentials

### Route Protection
- `/dashboard/*` - Requires authentication
- `/admin/*` - Requires admin role
- `/login`, `/register` - Redirect to dashboard if authenticated

## 👥 User Roles

### Entrepreneur
- Can register startup
- Can claim existing startup
- Can edit owned startup profile
- Can view public startup data

### Investor
- Can view premium startup data (contact info, pitch decks)
- Can browse and search startups
- Premium access to investment opportunities

### Admin
- Can review and approve submissions
- Can manage users
- Can manually add startups
- Can moderate claims

## 🛠 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Form Validation**: Zod
- **Form Handling**: React Hook Form

## 📚 Documentation

- [Implementation Roadmap](../docs/IMPLEMENTATION_ROADMAP.md) - Complete development plan
- [Phase 1 Completion](./PHASE1_COMPLETION.md) - Phase 1 status and testing guide
- [Database Schema](../docs/DATABASE_SCHEMA.md) - Database structure and RLS policies
- [Technical Specification](../docs/TECHNICAL_SPEC.md) - Detailed technical specs
- [Product Requirements](../docs/PRD.md) - Product requirements document

## 🧪 Testing

After Supabase configuration, test:

- ✅ User registration (entrepreneur and investor)
- ✅ Email verification
- ✅ User login
- ✅ Password reset flow
- ✅ Dashboard access
- ✅ Route protection
- ✅ Role-based UI

See [PHASE1_COMPLETION.md](./PHASE1_COMPLETION.md) for detailed testing checklist.

## 🗺 Roadmap

### Phase 1: Authentication ✅ DONE
- User registration and login
- Role-based access control
- Password reset flow
- User dashboard

### Phase 2: Public Directory (Next)
- Homepage with featured startups
- Startup directory page
- Startup detail pages
- Search and filters

### Phase 3: Admin Panel
- Submission review queue
- User management
- Approval workflows

### Phase 4: Ownership & Profiles
- Startup claiming
- Profile editing
- Investor premium access

### Phase 5: Polish & Launch
- SEO optimization
- Performance tuning
- Accessibility audit
- Production deployment

## 🤝 Contributing

This is a solo project for the Aragón startup ecosystem. For questions or issues, please refer to the documentation.

## 📄 License

All rights reserved © 2025 Aragón Startups

---

**Current Status**: Phase 1 Complete - Ready for Supabase configuration
**Next Step**: Configure Supabase and test authentication flows
**Estimated Completion**: 4-6 weeks total (Phase 1: ✅ Done)
