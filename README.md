# RAFIQ Web System (Frontend)

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-0.0.0-blue)
![License](https://img.shields.io/badge/license-Unlicensed-lightgrey)

A responsive, role-based RAFIQ frontend built with React and Vite for managing tourists, guides, trips, users, and finance operations in one unified interface.

This project is designed for teams who need clear operational workflows, RBAC-secured pages, and support for both static demo mode and real API mode.

## Project Overview

- Project name: RAFIQ Web System (Frontend)
- Description: A modern React dashboard for tourism business operations, including authentication, CRUD workflows, role-based access, and finance reporting.
- Tech stack: React 19, Vite, Tailwind CSS, React Router, Axios, Formik, Yup, i18next, Recharts
- Target audience: Developers, QA engineers, professors/reviewers, and project stakeholders/clients

## Features

- Role-based access control (Admin, Manager, Operations, Finance, Viewer)
- Protected routes with authentication guard
- Tourists management (list, details, create, edit, delete)
- Guides management (list, details, create, edit, delete)
- Trips management (list, details, create, edit, assignment flows)
- Users management for admin workflows
- Finance dashboard and salary summary views
- Global alert/confirmation dialogs for destructive actions
- Toast notifications for user feedback
- i18n-ready app structure with translation files (EN/AR)
- API-first live mode with static fallback for controlled migration
- React 19 action workflows (useActionState/useFormStatus/use) in admin modules

## Prerequisites

Before running the project, make sure your environment includes:

- Node.js 18.x or newer
- npm 9.x or newer
- Git
- A modern browser (Chrome, Firefox, Edge, or Safari)

## Dependencies

Main runtime dependencies:

- react, react-dom
- react-router-dom
- axios
- formik, yup
- react-hot-toast
- i18next, react-i18next
- recharts
- lucide-react

Development dependencies:

- vite, @vitejs/plugin-react
- eslint and related plugins
- tailwindcss, postcss, autoprefixer

## Installation

```bash
# 1) Clone the repository
git clone <your-repository-url>

# 2) Move into the frontend app
cd <repository-root>/frontend

# 3) Install dependencies
npm install

# 4) Create local environment file
cp .env.example .env

# 5) Start development server
npm run dev
```

The app will run at `http://localhost:5173` by default.

## Usage Examples

### Run in static mode (fallback)

```bash
# .env
VITE_API_MODE=static
VITE_AUTH_MODE=static

# Start app
npm run dev
```

### Run in API mode (recommended)

```bash
# .env
VITE_API_MODE=api
VITE_AUTH_MODE=api
VITE_API_BASE_URL=https://your-api-base-url
VITE_AUTH_API_URL=https://your-auth-api-url

# Restart after env changes
npm run dev
```

### Call a service function from a page/component

```jsx
import { useEffect, useState } from 'react';
import { getUsers } from '../services/api/userApi';

export default function ExampleUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      // Page params are optional and can be adjusted based on backend contract
      const response = await getUsers({ page: 1, pageSize: 10 });
      setUsers(response.data || []);
    };

    loadUsers();
  }, []);

  return <pre>{JSON.stringify(users, null, 2)}</pre>;
}
```

### Use confirmation dialog before delete

```jsx
import useAlert from '../hooks/useAlert';

function DeleteButton({ onDelete }) {
  const { confirm } = useAlert();

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: 'This action cannot be undone.',
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await onDelete();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Project Structure

```text
frontend/
├── public/                        # Static public assets
├── src/
│   ├── assets/                    # Images/icons/fonts
│   ├── components/
│   │   ├── auth/                  # Auth and route-guard components
│   │   ├── dashboard/             # Dashboard widgets/cards/charts
│   │   ├── finance/               # Finance-specific UI blocks
│   │   ├── guides/                # Guide domain components
│   │   ├── layout/                # App shell: sidebar/header/footer/layout
│   │   ├── tourists/              # Tourist domain components
│   │   ├── trips/                 # Trip domain components
│   │   ├── ui/                    # Shared UI primitives
│   │   └── users/                 # User management components
│   ├── config/                    # Constants, permissions, routes
│   ├── context/                   # Global state providers (Auth, Alert)
│   ├── hooks/                     # Custom hooks (auth, alert, pagination...)
│   ├── locales/                   # Translation resources (en/ar)
│   ├── pages/                     # Route-level page components
│   ├── services/
│   │   ├── api/                   # Real API clients (Axios based)
│   │   ├── static/                # Mock/static service implementations
│   │   └── index.js               # Service mode factory/helpers
│   ├── styles/                    # Global styles and variables
│   ├── types/                     # Domain model definitions (JS objects)
│   ├── utils/                     # Error, storage, format, validation helpers
│   ├── App.jsx                    # App routes/providers composition
│   └── main.jsx                   # React app bootstrap
├── .env.example                   # Environment variable template
├── netlify.toml                   # Netlify SPA redirect config
├── package.json                   # Scripts and dependencies
└── vite.config.js                 # Vite config and dev proxy
```

## Configuration

Create a `.env` file in the frontend root.

| Variable | Type | Required | Default | Description |
|---|---|---|---|---|
| `VITE_API_MODE` | string | Yes | `static` | Data source mode: `static` or `api` |
| `VITE_AUTH_MODE` | string | Yes | `static` | Auth source mode: `static` or `api` |
| `VITE_API_BASE_URL` | url | Required in API mode | `http://localhost:3000/api` | Base URL for application API |
| `VITE_AUTH_API_URL` | url | No | falls back to `VITE_API_BASE_URL` | Base URL for auth API |
| `VITE_APP_TITLE` | string | No | `RAFIQ` | Browser/app title |

For the current admin migration flow, set `VITE_API_MODE=api` to use live Touresta endpoints (Dashboard, Audit, Management, Reports).

## Scripts

```bash
npm run dev      # Start Vite dev server
npm run build    # Create production build
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Additional Documentation

- API reference: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)
- Architecture overview: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Setup and deployment guide: [docs/SETUP_AND_DEPLOYMENT.md](docs/SETUP_AND_DEPLOYMENT.md)
- Version history: [CHANGELOG.md](CHANGELOG.md)

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Make focused changes with clear commit messages.
4. Run checks before opening a PR:
   - `npm run lint`
   - `npm run build`
5. Open a Pull Request with:
   - Problem statement
   - Summary of changes
   - Testing notes
   - Screenshots (for UI updates)

## License

This repository currently has no dedicated license file.

If you plan to open-source this project, add a `LICENSE` file (commonly MIT, Apache-2.0, or GPL-3.0) and update this section accordingly.
