# AI Agent Instructions for graduationProject-main

## Purpose
This repository is a React + Vite admin frontend for the RAFIQ platform. The app is organized as a domain-driven SPA with route-level pages, shared UI primitives, and an authentication/permissions shell.

## Useful shortcuts
- `npm install` to install dependencies
- `npm run dev` to start the Vite development server
- `npm run build` to create a production build
- `npm run lint` to run ESLint over the repo

## High-level architecture
- `src/pages`: route-level screens and pages
- `src/components`: reusable UI components, domain components, and layout primitives
- `src/context`: React providers for auth, alert, theme, sound, notifications
- `src/hooks`: generic hooks for auth, alert, pagination, permissions, responsiveness
- `src/services`: service layer and Axios-based API clients
- `src/config`: constants, routes, and role-based permissions
- `src/styles`: Tailwind + global CSS tokens
- `src/locales`: English and Arabic translations

## Important conventions
- The app uses React 19 with functional components, hooks, and React Router DOM 7.
- Tailwind CSS v4 is the primary styling method.
- Forms use Formik + Yup validation.
- Authentication state is managed by `AuthContext` and persisted in local storage.
- Route and UI access control rely on `ProtectedRoute` and `src/config/permissions.js`.
- The app is designed to work in an API mode; backend integration is expected through the service layer.

## Key files to inspect first
- `src/main.jsx` – app bootstrap and provider composition
- `src/App.jsx` – route tree and app shell structure
- `src/config/routes.js` – route definitions
- `src/config/permissions.js` – role and permission mapping
- `src/services/index.js` – data service factory / API mode handling
- `src/components/layout/MainLayout.jsx` – shell layout and navigation

## Existing documentation
- [Architecture overview](docs/ARCHITECTURE.md)
- [Project blueprint and documentation](DOCS.md)

## How to help
- Prefer small, incremental changes aligned with existing component and layout patterns.
- Keep domain logic in `src/services` and `src/config` rather than scattering API details into components.
- Use existing shared UI primitives from `src/components/ui` when adding forms, tables, cards, modals, and buttons.
- Follow the existing role-based navigation and permission patterns when adding new admin features.
