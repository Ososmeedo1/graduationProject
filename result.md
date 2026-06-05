# RAFIQ Web System
## A Modern Tourism Management Platform

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Objectives](#-objectives)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Application Architecture](#application-architecture)
- [Key Components](#key-components)
- [User Roles & Access Control](#-user-roles--access-control)

---

## Project Overview

**RAFIQ Web System** is a comprehensive, role-based frontend application designed for modern tourism business operations. It provides a unified, responsive interface for managing tourists, guides, trips, users, and financial operations with advanced administrative capabilities.

### Key Highlights

✅ **Modern UI/UX** - Responsive design that works seamlessly on desktop, tablet, and mobile devices  
✅ **Secure Access** - Role-based access control (RBAC) with authentication guards  
✅ **Multi-Language Support** - Native support for English and Arabic with RTL layout  
✅ **Real-Time Updates** - SignalR integration for live notifications and data sync  
✅ **Production Ready** - Built with React 19, Vite, and industry best practices

---

## 🎯 Objectives

### 1. **Operational Excellence**
Provide tourism businesses with a centralized console for day-to-day operations, enabling quick decision-making and efficient resource management.

### 2. **Enhanced Security & Access Control**
Implement robust role-based access control to ensure team members only access information and functions relevant to their roles (Admin, Manager, Operations, Finance, Viewer).

### 3. **Streamlined Tourism Management**
Enable seamless management of core tourism entities:
- **Tourists**: Complete lifecycle management with profiles and booking history
- **Guides**: Onboarding, verification, performance tracking, and review workflows
- **Trips**: End-to-end trip planning, assignment, and execution tracking
- **Finance**: Salary management, invoicing, payment tracking, and financial reporting

### 4. **Real-Time Visibility & Analytics**
Deliver comprehensive dashboards with KPIs, analytics, and live monitoring capabilities to support data-driven decision-making.

### 5. **User-Centric Design**
Create an intuitive, accessible interface with support for multiple languages and seamless navigation across all operational modules.

### 6. **Scalable & Maintainable Architecture**
Build a modern, component-based architecture that's easy to maintain, test, and extend for future requirements.

---

## ✨ Features

### 🏢 Core Management Modules

#### **Tourism Management**
- **Guides Dashboard** - Comprehensive guide lifecycle management
  - Create, view, edit, and delete guide profiles
  - Verification and approval workflows
  - Performance tracking and reviews
  - Integration with onboarding processes

- **Tourists Management** - Complete tourist data handling
  - Tourist profile creation and updates
  - Booking history and preferences
  - Communication and notification logs
  - Demographic and travel information

- **Trips Management** - Full trip lifecycle control
  - Trip creation and scheduling
  - Guide and tourist assignment
  - Real-time trip status tracking
  - Itinerary management and documentation

### 📊 Administrative Dashboard
- **KPI Cards** - Key metrics at a glance
  - Revenue metrics
  - Booking statistics
  - Guide performance indicators
  - Occupancy rates

- **Analytics Charts** - Visual data representation
  - Trend analysis and forecasting
  - Performance comparisons
  - Monthly and yearly reports

- **Recent Activity Widget** - Quick operational insights
  - Latest bookings and transactions
  - System events and notifications

### 💰 Finance & Operations

- **Salary Management** - Employee compensation tracking
  - Salary calculations and summaries
  - Commission tracking
  - Payment history and reconciliation

- **Invoicing System** - Invoice creation and management
  - Automated invoice generation
  - Payment tracking
  - Invoice history and archival

- **Financial Reports** - Comprehensive reporting
  - Monthly, quarterly, and annual reports
  - Export capabilities for analysis
  - Customizable report generation

- **Audit Trail** - Complete transparency
  - All financial transactions logged
  - User activity tracking
  - System event monitoring

### 👥 User & Admin Management

- **Users Management** - Internal user account control
  - User creation and role assignment
  - Permission management
  - Account status and security controls

- **Admin Console** - Centralized administration
  - Helper moderation and review
  - Interview management and oversight
  - Chat monitoring and management
  - Pricing administration
  - System settings and configurations

### 🔔 Communication & Notifications

- **Notifications System**
  - Real-time push notifications
  - Email notifications
  - In-app notification center
  - Notification preferences and customization

- **Admin Chat Management** - Oversight capabilities
  - Monitor communication channels
  - Flag and manage inappropriate content
  - Bulk messaging capabilities

### 🌍 Global Features

- **Multi-Language Support**
  - English and Arabic interfaces
  - Automatic language detection
  - RTL (Right-to-Left) support for Arabic

- **Responsive Design**
  - Desktop, tablet, and mobile support
  - Adaptive layouts
  - Touch-friendly interfaces

- **Dark/Light Theme**
  - System theme customization
  - User preference persistence
  - Accessible color contrast

- **Real-Time Updates**
  - WebSocket integration (SignalR)
  - Live data synchronization
  - Instant notifications and alerts

---

## 🛠️ Technology Stack

### **Frontend Framework & Build Tools**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.x | Modern UI library with hooks and latest features |
| **React DOM** | 19.x | React rendering engine |
| **Vite** | 7.x | Lightning-fast build tool and dev server |
| **Node.js** | 18.x+ | JavaScript runtime environment |
| **npm** | 9.x+ | Package manager |

### **Routing & Navigation**

| Technology | Purpose |
|-----------|---------|
| **React Router DOM** | 7.x - Client-side routing and nested layouts |

### **State Management & Data**

| Technology | Purpose |
|-----------|---------|
| **Context API** | Lightweight state management for auth, theme, alerts, notifications |
| **Axios** | HTTP client for API communication |
| **Formik** | Form state management and handling |
| **Yup** | Schema validation for forms and data |

### **UI & Styling**

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Headless UI** | 2.x | Unstyled, accessible UI components |
| **Lucide React** | Latest | Beautiful icon library |
| **PostCSS** | 8.x | CSS transformation tool |
| **Autoprefixer** | Latest | Vendor prefix automation |

### **Visualization & Charts**

| Technology | Purpose |
|-----------|---------|
| **Recharts** | Composable charting library for analytics |

### **Internationalization & Localization**

| Technology | Purpose |
|-----------|---------|
| **i18next** | Multi-language and translation management |
| **react-i18next** | React integration for i18next |
| **i18next-browser-language-detector** | Automatic language detection |

### **Real-Time Communication**

| Technology | Purpose |
|-----------|---------|
| **Microsoft SignalR** | Real-time bi-directional communication for live updates |

### **Maps & Location**

| Technology | Purpose |
|-----------|---------|
| **Leaflet** | Open-source mapping library |
| **react-leaflet** | React wrapper for Leaflet |

### **User Feedback & Notifications**

| Technology | Purpose |
|-----------|---------|
| **React Hot Toast** | Beautiful toast notifications |

### **Quality Assurance & Development**

| Technology | Purpose |
|-----------|---------|
| **ESLint** | JavaScript linting and code quality |
| **ESLint Plugins** | React and hooks specific linting rules |
| **Terser** | JavaScript minification |

---

## 🏗️ Application Architecture

### **Layered Architecture**

```
┌─────────────────────────────────────┐
│      Pages & Route Views            │  ← User-facing pages
├─────────────────────────────────────┤
│     Components (UI + Containers)    │  ← Reusable UI components
├─────────────────────────────────────┤
│   Hooks & Context (State Logic)     │  ← Application state
├─────────────────────────────────────┤
│    Services (API & Business Logic)  │  ← Data access layer
├─────────────────────────────────────┤
│      Utilities & Helpers            │  ← Cross-cutting concerns
├─────────────────────────────────────┤
│         Backend APIs                │  ← External services
└─────────────────────────────────────┘
```

### **Data Flow**

1. **User Interaction** → Component state update
2. **Data Submission** → Form validation (Yup)
3. **API Call** → Axios service layer
4. **Backend Request** → REST/SignalR APIs
5. **Response Handling** → State update via Context/hooks
6. **UI Re-render** → Updated component display

### **Context Providers**

- **AuthContext** - Authentication state and token management
- **ThemeContext** - Dark/light theme and layout preferences
- **AlertContext** - Global alerts and confirmations
- **NotificationsContext** - User notifications and alerts
- **SoundContext** - Sound preferences and playback

---

## 🔧 Key Components

### **Layout Components**
- `MainLayout` - Main application shell
- `Header` - Navigation bar with user menu
- `Sidebar` - Role-aware navigation menu
- `MobileDrawer` - Mobile navigation drawer
- `Footer` - Application footer

### **Authentication**
- `LoginForm` - User login interface
- `ProtectedRoute` - Route guard for authenticated access

### **Dashboard**
- `KPICard` - Metric display card
- `StatsChart` - Analytics visualization

### **Admin Modules**
- **Audit Management** - Activity and transaction logs
- **Booking Management** - Booking lifecycle and status
- **Interview Management** - Interview creation and review
- **Invoice Management** - Financial documentation
- **Payment Processing** - Transaction handling
- **Reporting** - Business intelligence and analytics
- **SOS Management** - Emergency and support requests

### **Feature Components**
- **Guides** - Guide management and profiles
- **Tourists** - Tourist information and management
- **Trips** - Trip planning and execution
- **Users** - User account management
- **Maps** - Location-based services

### **UI Primitives**
- Alert Dialogs, Badges, Buttons, Cards
- Input fields, Select dropdowns, Modals
- Tables, Skeletons, Empty/Error states
- Language Switcher, Theme Customizer
- File Viewer Modal

---

## 🗂️ Per-Page Summaries & Screenshots

Below are short, presentation-friendly summaries for key pages, the main features each page uses, and screenshots from the project folder.

### Login page
- Summary: Simple, accessible login form with validation and clear error handling.
- Key features: Email/password entry, validation, error feedback, redirect on success.
- Technologies used: `React`, `Formik`, `Yup`, `Axios`, `Tailwind CSS`, `i18next` for localized labels.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_133542.png)

### OTP page
- Summary: One-time-password entry screen used for 2FA or phone verification.
- Key features: OTP input, resend code, countdown timer, accessibility focus management.
- Technologies used: `React`, `Tailwind CSS`, `Axios`, small timer hook.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_133836.png)

### Forgot password page
- Summary: Password recovery flow with email verification and reset instructions.
- Key features: Email capture, validation, confirmation state, link/email feedback.
- Technologies used: `React`, `Formik`, `Yup`, `Axios`, `Tailwind CSS`, `i18next`.
- Screenshots:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260602_200001.png)
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260602_200052.png)

### Dashboard page
- Summary: Main operational dashboard showing KPIs, recent activity, and quick actions.
- Key features: KPI cards, charts, recent activity, quick filters and links to modules.
- Technologies used: `React`, `Recharts`, `Axios`, `Tailwind CSS`, Context API.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134013.png)

### Admin Management page
- Summary: Centralized user and admin account management view with role assignment.
- Key features: User list, search/filters, role assignment, create/edit dialogs, status toggles.
- Technologies used: `React`, `Tailwind CSS`, `Axios`, form handling via `Formik`.
- Screenshots:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134153.png)
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134238.png)

### Chat Hub page
- Summary: Admin-facing chat hub for monitoring and moderating conversations.
- Key features: Conversation list, live updates, message view, moderation actions (flag/delete).
- Technologies used: `React`, `Microsoft SignalR`, `Axios`, `Tailwind CSS`.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134318.png)

### Audit logs page
- Summary: Immutable activity log showing user actions and system events for compliance.
- Key features: Filterable logs, search, export capability placeholder, per-event details.
- Technologies used: `React`, `Axios`, `Tailwind CSS`, server-side pagination patterns.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134546.png)

### Admin Reports page
- Summary: Reporting hub for finance and operations with exportable charts and summaries.
- Key features: Charts, date-range filters, downloadable reports, KPI breakdowns.
- Technologies used: `Recharts`, `Axios`, `Tailwind CSS`, CSV/PDF export helpers.
- Screenshots:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134601.png)
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134616.png)

### Pricing page
- Summary: Administrative pricing and packages editor for tours and services.
- Key features: Price tiers, create/edit plans, effective-dates, bulk update placeholders.
- Technologies used: `React`, `Formik`, `Yup`, `Axios`, `Tailwind CSS`.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_134703.png)

### Admin Profile page
- Summary: Admin user's profile and account settings, including security and contact details.
- Key features: Profile edit, avatar, contact info, password change link.
- Technologies used: `React`, `Formik`, `Axios`, `Tailwind CSS`.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260507_135123.png)

### Settings page (Themes & Preferences)
- Summary: UI customization and user preferences including theme selection and language.
- Key features: Theme toggle (dark/light), language switcher, notification preferences.
- Technologies used: `React`, Context API (`ThemeContext`), `i18next`, `Tailwind CSS`.
- Screenshot:
  ![](/home/Osama/SHA/graduation_project/GP/Pictures/Screenshot_20260602_200331.png)

## 👥 User Roles & Access Control

### **Role Hierarchy**

| Role | Permissions | Use Case |
|------|-------------|----------|
| **Admin** | Full system access, all CRUD operations, user/role management | System administrators and executives |
| **Manager** | Team oversight, reports, limited user management | Operations managers and supervisors |
| **Operations** | Day-to-day guide/trip management, booking handling | Operations specialists |
| **Finance** | Financial dashboard, salary management, reports | Finance and accounting team |
| **Viewer** | Read-only access to dashboards and reports | Stakeholders and analysts |

### **Features Access by Role**

Each module enforces role-based visibility and functionality:
- Sensitive pages redirect unauthorized users
- Sidebar items hidden for roles without access
- API endpoints validated for user permissions
- Audit logs track all user actions

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.x or newer
- npm 9.x or newer
- Modern web browser

### **Installation**

```bash
# Clone repository
git clone <repository-url>

# Navigate to project
cd Tourism

# Install dependencies
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

### **Build for Production**

```bash
npm run build
npm run preview
```

---

## 📈 Project Metrics

- **Total Components** - 50+ reusable components
- **Supported Languages** - 2 (English, Arabic)
- **User Roles** - 5 role-based access levels
- **API Integrations** - Tourism management backend
- **Real-Time Features** - SignalR WebSocket support
- **Responsive Breakpoints** - Mobile, tablet, desktop

---

## ✅ Current Status

✓ Authentication and authorization system  
✓ RBAC implementation and enforcement  
✓ Core tourism management modules  
✓ Financial and admin dashboards  
✓ Multi-language and RTL support  
✓ Responsive mobile-first design  
✓ Real-time notifications  
✓ Comprehensive audit trails  

---

## 🎓 Summary

**RAFIQ Web System** is a comprehensive, modern tourism management platform that combines:

- **Powerful Technology** - React 19, Vite, Tailwind CSS
- **Enterprise Features** - RBAC, real-time updates, multi-language
- **User-Centric Design** - Responsive, accessible, intuitive interface
- **Production Ready** - Scalable architecture, comprehensive testing

Perfect for tourism businesses looking to digitize and streamline their operations with a modern, secure, and scalable platform.

---

## 📞 Contact & Support

For questions, feature requests, or support, please reach out to the development team.

**Platform**: RAFIQ Tourism Management System  
**Version**: 0.0.90  
**License**: Unlicensed  
**Status**: Active Development

---

*Last Updated: June 2, 2026*
