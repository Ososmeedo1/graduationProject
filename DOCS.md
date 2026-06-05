# Project Blueprint & Documentation

This document is a technical roadmap for the RAFIQ Web System (Frontend). It describes what is implemented today, how the application is structured, and what still needs to be completed to reach a production-ready admin and operations platform.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Stack](#technical-stack)
3. [System Architecture](#system-architecture)
4. [Module Analysis](#module-analysis)
5. [Component Architecture](#component-architecture)
6. [API & Data Layer](#api--data-layer)
7. [Gap Analysis](#gap-analysis)
8. [TODOs and Next Steps](#todos-and-next-steps)

## Executive Summary

The frontend is a React-based admin and operations interface for the RAFIQ platform. Its primary purpose is to support admin workflows around helper onboarding and review, audit visibility, chat oversight, reporting, pricing management, and role-based administration.

The codebase currently functions as a centralized operations console. Authentication, role guards, theming, and localization are already present. The remaining work focuses on completing backend integrations, refining review workflows, and rounding out reporting and pricing administration.

## Technical Stack

### Core Framework

- React 19 with functional components and hooks.
- React Router DOM 7 for routing, nested layouts, and protected routes.
- Vite for development, bundling, and local proxying.

### State Management

- Context-based state is used for authentication, alerts, theme, and sound preferences.
- Local component state is used for most page-level UI concerns such as filters, loading states, dialogs, and pagination.
- Form state is handled with Formik.
- Validation is handled with Yup.
- No Redux or Zustand store is present in the current codebase.

### Networking and Data Access

- Axios is the HTTP client.
- A centralized `services/index.js` file exposes API facades for auth, admin modules, and reports.
- Vite dev server proxies `/api` requests to the backend host configured in `vite.config.js`.
- Authentication is token-based and stored in `localStorage`.

### Styling and UI

- Tailwind CSS v4 is the primary styling layer.
- Headless UI is used for accessible menu and transition primitives.
- Lucide React provides the icon set.
- The UI system is utility-first, responsive, and composed from reusable primitives.
- MUI is not used in the current implementation.

### UX and Feedback

- React Hot Toast provides notifications.
- Document metadata is managed natively through the browser document API.
- Recharts is used for charts and dashboards.

### Internationalization

- react-i18next powers translations.
- English and Arabic locale files are present.
- The language switcher updates `document.documentElement.dir` and `document.documentElement.lang`.
- RTL-aware utility classes are already in use across the layout and forms.

## System Architecture

### Application Bootstrap

The app starts in `src/main.jsx`, which loads i18n and global styles before rendering `App.jsx`.

`App.jsx` wraps the route tree with:

- `ThemeProvider` for theme and layout tokens.
- `SoundProvider` for UI sound preferences.
- `AuthProvider` for authentication state.
- `AlertProvider` for app-level notifications.
- `BrowserRouter` for navigation.
- `Toaster` for toast feedback.

### Route Structure

- Public routes cover login, forgot password, and reset password.
- Protected routes are wrapped by `ProtectedRoute`.
- Application pages are nested inside `MainLayout`.
- Errors are handled through dedicated 404 page routing.

### Access Control

- Permissions are defined centrally in `src/config/permissions.js`.
- Roles include admin, manager, operations, finance, and viewer.
- Sidebar items are hidden when the active role lacks access.
- `ProtectedRoute` blocks unauthenticated access and redirects to login.

### UI Shell

- `MainLayout` provides the responsive shell.
- `Header` contains language switching, notifications, and profile actions.
- `Sidebar` provides role-aware navigation.
- `MobileDrawer` handles small screens.
- `Footer` completes the shell.

### Data Mode Switching

The current implementation is API-first. Static services were part of earlier scaffolding, but the active services in `src/services/index.js` focus on the admin API surface.

## Module Analysis

### Folder-to-Module Map

| Folder | Role | Current Coverage | Notes |
| --- | --- | --- | --- |
| `src/pages/auth` and `src/components/auth` | Authentication and route protection | Login, forgot password, reset password, protected routing | OTP login flow is supported in the auth service and context logic |
| `src/pages/admin` and `src/components/admin` | Admin console | Dashboard, audit, interviews, chat management, helper/admin management, pricing, reports | Core operations center for RAFIQ admin users |
| `src/pages/helpers` and `src/components/helpers` | Helper lifecycle | Helper list, detail, create/edit, filters | Supports onboarding and review workflows |
| `src/pages/users` and `src/components/users` | Internal admin users | User list and user form | Used for admin account management |
| `src/components/layout` | Shell and navigation | Header, sidebar, mobile drawer, footer, main layout | Enforces responsive navigation and locale switching |
| `src/components/ui` | Shared primitives | Inputs, buttons, cards, tables, modals, badges, skeletons, empty/error states | Base layer for the whole UI system |
| `src/services` | Data access and feature services | API implementations, interceptors, i18n bootstrap | Centralizes auth and admin endpoints |
| `src/config` | Environment and permissions | Constants, route definitions, permission matrix | Keeps business rules and environment settings centralized |
| `src/context` | Cross-cutting app state | Auth, alert, theme, sound providers | Lightweight state layer instead of Redux/Zustand |
| `src/hooks` | Reusable UI logic | Auth, permissions, pagination, responsive, debounce, alerts | Encapsulates common interaction patterns |
| `src/locales` | Translation resources | English and Arabic UI strings | Enables bilingual UX |
| `src/utils` | Formatting and helpers | Date, time, number, currency, storage, validation, error handling | Shared logic for presentation and persistence |

### Admin Console

The admin console is the operational heart of the system.

What exists today:

- Admin dashboard stats and recent activity widgets.
- Audit log browsing.
- Helper management, including state transitions and moderation actions.
- Admin management for roles and account states.
- Interview review flows with detail view.
- Chat management for oversight.
- Pricing management for RAFIQ offerings.
- Reports dashboard with downloadable summaries.

What is still missing:

- Comprehensive inline editing for advanced admin fields.
- Bulk actions across lists (helpers, admins, interviews).
- Audit log export and saved filters.
- Role policy editing UI for fine-grained permissions.

Interpretation:

- The admin console is functional for day-to-day operations.
- The next step is to mature it into a full governance and analytics center.

### Helper Lifecycle

The helper module supports onboarding and ongoing compliance.

What exists today:

- Helper list with filters and status badges.
- Helper detail view with profile data and admin actions.
- Create and edit helper forms.
- Review states (under review, approved, rejected, suspended, banned).

What is still missing:

- Document verification workflows (IDs, contracts, certifications).
- Automated reminders and follow-up tasks.
- SLA tracking and escalation logic for pending reviews.

Interpretation:

- The helper lifecycle is in place for core moderation.
- The operational tooling around compliance still needs to be expanded.

### Reporting and Pricing

Reporting and pricing are concentrated in admin modules.

What exists today:

- Reports overview with summary cards and export-ready data.
- Financial summary and helper analytics reporting.
- Pricing management views for service pricing and adjustments.

What is still missing:

- Scheduled report delivery and saved dashboards.
- Pricing version history and audit trail for adjustments.
- Revenue breakdowns by region, category, or time period.

Interpretation:

- Reporting is functional for operational snapshots.
- Long-term analytics and governance features are still pending.

### Interviews and Audit

Interview review and audit logging help ensure quality control.

What exists today:

- Interview review queue and detail view.
- Audit log list and helper audit views.

What is still missing:

- Interview scoring rubrics and structured feedback capture.
- Audit log search and advanced filtering.
- Cross-linking between audit logs and admin actions.

### Users and RBAC

The users module and permission system support admin access control.

What exists today:

- Internal user list and user form.
- Centralized role definitions.
- Permission-to-role matrix.
- Sidebar-level access filtering.
- Protected route redirection for unauthenticated access.

What is still missing:

- A full policy editor for custom roles.
- Fine-grained UI-level permission enforcement on every action.
- Audit history for user role changes and sensitive actions.

## Component Architecture

### Architecture Layers

The component system is organized in a predictable hierarchy:

1. UI primitives in `src/components/ui`.
2. Shared layout in `src/components/layout`.
3. Auth controls in `src/components/auth`.
4. Domain-specific components in `src/components/admin`, `src/components/helpers`, and `src/components/users`.
5. Route containers in `src/pages`.

### Shared Primitives

Reusable building blocks include:

- `Button`, `Input`, `Select`, `Card`, `Modal`, `AlertDialog`, `Badge`, `Table`, `Skeleton`, `EmptyState`, `ErrorState`, and `Avatar`.
- `LanguageSwitcher` handles locale changes.

These primitives should remain presentation-focused and business-agnostic.

### Domain Components

#### Admin Dashboard

- `KPICard` standardizes key numbers.
- `StatsChart` provides trend visualization.
- Audit and recent activity widgets summarize operations.

#### Helper Management

- `HelperCard`, `HelperTable`, and `HelperFilters` present list views.
- `HelperForm` manages helper creation and updates.

#### Admin Management

- Admin list and form components for account and role management.

#### Reports and Pricing

- Report summary cards and data tables.
- Pricing forms and detail panels for admin updates.

### Component Hierarchy Guidance

The current hierarchy can be thought of as:

- Primitive input and display components at the bottom.
- Reusable domain widgets in the middle.
- Page-level composition at the top.

For the next stage of implementation, the system should introduce or standardize a few missing reusable components that admin platforms usually need:

- `BulkActionBar` for batch operations.
- `AuditFilters` for complex log queries.
- `ReportExportPanel` for multi-format exports.
- `PolicyEditor` for role and permission management.

## API & Data Layer

### Current Data Flow

1. A page or domain component triggers an action.
2. The component calls a service function.
3. The service function calls Axios-backed API endpoints.
4. Results are normalized into component state.
5. Errors are surfaced with toast notifications or form-level validation.

### Service Pattern

`src/services/index.js` exposes a facade over multiple admin API domains:

- `auth` for login, OTP verification, and password reset.
- `dashboard` for summary metrics and recent activity.
- `helpers` for helper lifecycle operations.
- `admins` for admin account and role management.
- `reports` for analytics and summary exports.
- `audit`, `chats`, `interviews`, and `pricing` for admin operations.

### Axios and Backend Integration

- `src/services/api/axios.js` defines the Axios client.
- `src/services/api/interceptors.js` activates request and response interceptors.
- Vite proxies `/api` traffic to the configured backend host during development.

### Current API Surface

Observed resource endpoints include:

- Auth: password verification, OTP verification, reset flows, and session state.
- Admin dashboard: stats, recent helpers, and activity feed.
- Helper management: list, detail, create, update, moderation actions.
- Admin management: users, roles, activation/deactivation.
- Reports: booking summaries, financial summary, helper analytics.
- Audit: audit log list and helper audit history.
- Interviews: review list and detail.
- Chats and pricing management endpoints.

### Auth Flow

The auth flow is centered around the admin auth API.

- The login step verifies email and password.
- The OTP step validates the verification code.
- Tokens and user data are stored in `localStorage`.
- `AuthContext` initializes auth state from storage on app load.

### Data Shape Conventions

- Collection endpoints typically return `{ data, meta }`.
- Detail endpoints return a single entity.
- Form submissions rely on the same field names as the service contracts where possible.

## Gap Analysis

This section identifies the main missing links for a mature admin and operations platform and what is still needed to reach production readiness.

| Area | Current State | Impact | Recommended Completion |
| --- | --- | --- | --- |
| Admin policy editor | Roles are fixed in config | Limited flexibility for enterprise customers | Build a role/permission editor UI backed by policy APIs |
| Bulk moderation | Per-record actions only | Slower operational throughput | Add bulk approve/reject/suspend actions |
| Audit depth | Basic list view | Harder compliance investigations | Add advanced filters, exports, and log linking |
| Reporting maturity | Snapshot summaries only | Limited insights for leadership | Add saved dashboards and scheduled exports |
| Pricing governance | Manual updates only | Risk of untracked changes | Add pricing history, approval, and audit trail |

## TODOs and Next Steps

1. Complete admin policy editor and fine-grained permission enforcement.
2. Implement bulk workflows across helpers, admins, and interviews.
3. Expand audit tooling with filters, exports, and action linking.
4. Add scheduled reports and saved dashboards for leadership views.
5. Implement pricing change history and approval workflow.
