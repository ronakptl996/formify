# Formify 🌌

Welcome to **Formify**, a production-style, high-fidelity Typeform-style Form Builder SaaS monorepo. It features drag-free creator form builders, visual spreadsheet response analytics, customizable interactive themes, simulated transactional email notifications, and fully-interactive Scalar API developer sandboxes.

---

## 🛠️ Tech Stack

Formify is architected inside a type-safe Turborepo monorepo using standard industry practices:

- **Monorepo Engine**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js 16 (App Router)](https://nextjs.org/) styled with Vanilla CSS and modern dark Obsidian theme aesthetics.
- **API Framework**: [tRPC v11](https://trpc.io/) for end-to-end type safety, integrated with [Express](https://expressjs.com/).
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) with [Drizzle ORM](https://orm.drizzle.team/).
- **Validation**: [Zod](https://zod.dev/) schemas.
- **API Documentation**: [Scalar API Reference](https://scalar.com/) with automated OpenAPI JSON generation.

---

## 📂 Project Architecture

```
├── apps
│   ├── api                 # Express API server hosting tRPC & Scalar documentation
│   └── web                 # Next.js frontend with creator builder & analytics
├── packages
│   ├── database            # PostgreSQL models, Drizzle schemas, migrations & seed scripts
│   ├── services            # Authentication & third-party service abstractions
│   ├── trpc                # Core tRPC routers, server contexts & procedurals
│   ├── typescript-config   # Workspace typescript configuration shares
│   └── eslint-config       # Lint configuration shares
```

---

## 🚀 Setting Up the Project

Follow these simple steps to spin up the local development environment:

### 1. Configure the Environment

The workspace uses a single master environment file. Create a `.env` file at the root:

```bash
DATABASE_URL=postgresql://postgres:root@localhost:5432/formbuilder
PORT=8000
NODE_ENV=development
BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. Install Workspace Dependencies

```bash
pnpm install
```

### 3. Setup the Database & Run Seeder

Make sure PostgreSQL is running locally on port 5432 (default credentials match the env URL). Then execute:

```bash
# Generate schemas
pnpm db:generate

# Execute migrations
pnpm db:migrate

# Populate pre-seeded demo user and simulated forms/responses
pnpm db:seed
```

### 4. Boot Development Servers

Launch both the frontend client and backend API server simultaneously:

```bash
pnpm dev
```

- **Client App**: `http://localhost:3000`
- **Express API Backend**: `http://localhost:8000`
- **Interactive API Reference (Scalar)**: `http://localhost:8000/docs`

---

## 👤 Seeded Demo Credentials

Skip manual registration and test all high-fidelity creator analytics pages instantly with these seeded credentials:

- **Email**: `admin@formify.com`
- **Password**: `password123`
- **Developer API Key**: `formify_demo_api_key_2026_ninja`

---

## 🌐 Calling the backend API via curl

Because the monorepo mounts standard tRPC endpoints under `/trpc` and clean REST OpenAPI endpoints under `/api`, utilize the correct prefixes based on your query format:

### A. Calling via standard tRPC Protocol

Pass queries directly using the `/trpc/` prefix:

```bash
curl 'http://localhost:8000/trpc/form.listPublicForms'
```

### B. Calling via standard REST OpenAPI

Query formatted endpoints directly using the `/api/` prefix:

```bash
curl 'http://localhost:8000/api/forms/explore'
```

---

## 🎨 Creative Theme Presets

Formify includes dynamic styling and responsive design tokens that render immersive interfaces instantly inside the browser:

- **Cyberpunk**: Neon grids, high-contrast cyan-to-purple borders.
- **Anime Sunset**: Cherry-sunset gradients, warm fonts, and rounded pill inputs.
- **Retro Mac**: Classic system-gray borders, monospaced fonts, and block button shadows.
- **Startup Dark**: Slate glassmorphism panels, glowing borders, and clean typography.
