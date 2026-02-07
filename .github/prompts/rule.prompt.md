---
name: rule
description: Describe when to use this prompt
---
# AGENT_RULES.md

This file provides strict guidance for the AI Agent when working with code in this repository.

## Project Overview

This is a **Next.js 16** application focusing on inventory/lifecycle features, built with a modern, high-performance tech stack. The project emphasizes a strict separation of concerns between **UI Atoms**, **Domain Entities**, and **Feature Pages**.

## 1. Tech Stack & Core Frameworks

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (CSS-variable based, no config files)
- **UI Library**:
  - **Primary**: Shadcn UI (Radix Primitives)
  - **Visual Enhancements**: MagicUI (Animations/Effects)
- **Icons**:
  - Standard: `lucide-react`
  - Interaction/Emphasis: `lucide-animated` (Use for hover states/actions)
- **Forms & Validation**: React Hook Form + Zod
- **State Management**:
  - URL State: `nuqs` (Prioritize for filters/search/pagination)
  - Global App State: React Context
- **Database**: SQLite with Prisma v6
- **Date Handling**: `date-fns`
- **Hooks**: `@mantine/hooks` (Prioritize over writing custom hooks)

## 2. Architecture & File Structure

We follow a strict **Domain-Driven Design (DDD)** inspired structure within the frontend.

### Directory Layout

```text
src/
├── app/                        # Next.js App Router (Pages, Layouts, Server Actions)
│   ├── actions/                # Server Actions (split by domain: item.ts, category.ts)
│   └── inventory/              # Route: /inventory
│
├── components/
│   ├── ui/                     # Shadcn UI atoms (Button, Card, Input...). Pure UI.
│   │
│   ├── common/                 # Global Shared Components (Styling wrapper, no business logic)
│   │   ├── status-badge.tsx    # e.g., <StatusBadge variant="warning" />
│   │   ├── icon-button.tsx     # Standardized icon button wrapper
│   │   └── data-table/         # Reusable table logic
│   │
│   ├── modules/                # Entity Layer (Domain Logic & Specific UI)
│   │   └── item/               # [SCOPE: Item Object]
│   │       ├── hooks/          # use-item.ts (CRUD, business logic)
│   │       ├── ui/             # item-card.tsx, item-row.tsx (Presentational)
│   │       ├── types.ts        # Item-specific types
│   │       └── utils.ts        # Item-specific helpers (e.g., helpers for expiry)
│   │
│   └── features/               # Feature/Page Layer (Composition)
│       └── inventory/          # Logic for the specific Inventory Page
│           ├── inventory-view.tsx    # List/Grid switcher, Layout
│           └── inventory-toolbar.tsx # Search/Filter composition
│
├── hooks/                      # Global Generic Hooks (use-media-query, etc.)
├── lib/                        # Global Utilities (cn, prisma db instance)
└── types/                      # Shared/Global Types (API responses, Env types)
```

## 3. UI/Design Guidelines (Strict Mode)

### A. Styling Principles

- **Shadcn First**: ALL basic UI elements MUST use components from `@/components/ui`.
- **No Native Styling**: DO NOT use native HTML/CSS styling (e.g., no raw `<div style="...">`). Always use **Tailwind CSS v4** utility classes.
- **Visual Feedback**:
  - Interactive elements must have hover/active states.
  - Use **`lucide-animated`** for primary action buttons (e.g., delete, edit) to provide delight on hover.

### B. Composition Rules

- **Atomic Design**:
  1.  **Atoms**: `components/ui` (Shadcn) & `components/common`.
  2.  **Molecules**: `components/modules/*` (Entity specific components like `ItemCard`).
  3.  **Organisms**: `components/features/*` (Page sections like `InventoryList`).
- **Logic Placement**:
  - **UI Components** (`components/ui`, `common`) must remain dumb (pure presentation).
  - **Entity Logic** belongs in `modules/{entity}/hooks`.
  - **Page Logic** (routing, search params) belongs in `features` or `app`.

## 4. Coding Standards

### React Components

- Use **Functional Components** with named exports.
- **Hooks Preference**: Check `@mantine/hooks` documentation before writing a custom `useEffect`.
- **Server Actions**: Use Next.js Server Actions for mutations. Colocate them in `app/actions/`.

### State Management

- **URL as Truth**: For search, sorting, and filtering, use `nuqs` to keep state in the URL search params.
- **React Context**: Only use for truly global application state (e.g., User Session, Theme).

### Naming Conventions

- **Files**: `kebab-case.tsx` (e.g., `item-card.tsx`)
- **Components**: `PascalCase` (e.g., `ItemCard`)
- **Hooks**: `camelCase` starting with use (e.g., `useItem`)

## 5. Development Workflow

- **Run Dev Server**: `pnpm dev`
- **Database Migration**: `pnpm prisma migrate dev`
- **Package Manager**: **pnpm** (do not use npm/yarn)

## 6. Important Notes

- **Modularity**: When creating a new "Thing" (e.g., Category, User), always create a folder in `components/modules/`. Do not dump code into `features`.
- **Icons**: Import static icons from `lucide-react`. Import animated icons from the specific `lucide-animated` package/path only when interaction is required.

