# Project Roadmap: medusa-poc

**Objective:** Establish a high-leverage, modular commerce chassis that serves as the foundation for multi-vendor marketplace clients (clone, configure brand, ship).

This file is the product/engineering roadmap. Day-to-day context lives in `agents/`. Binding decisions live in `docs/adr/`.

## Phase 1: The Foundation (Developer Experience and Tooling)

*Goal: Strip out the starter bloat and replace it with a modern, high-performance developer experience.*

- [ ] **Linting and Formatting:** Replace ESLint/Prettier with **Biome** for faster, unified linting and formatting.
- [ ] **Frontend Stack Setup:**
    - Initialize Next.js with **Tailwind CSS**.
    - Integrate **shadcn/ui** as the primary component library (move away from standard Radix-only or custom-heavy components).
    - Implement **i18next** for multi-language support at the core level.
- [ ] **State Management:**
    - Implement **Zustand** for local UI state (modals, tabs, etc.).
    - Integrate **TanStack Query** (React Query) to handle server-side state, caching, and Medusa data synchronization.
- [ ] **Asset Pipeline:** Configure optimized image handling and a consistent icon library (e.g., Phosphor Icons).

## Phase 2: The Core Engine (Medusa Backend Customization)

*Goal: Move away from "Standard" Medusa to a custom multi-vendor-aware engine.*

- [ ] **Modular Architecture:** Define the core modules that will be shared across all projects (e.g., `CoreTradeModule`, `InventoryManager`).
- [ ] **The Multi-vendor Logic:**
    - Implement the **Consignment Logic**: A system to split one customer order into multiple fulfillment paths based on house IDs.
    - Build a **Commission Service**: Automatic calculation of take-rates per house.
- [ ] **Custom Subscriptions:** Create listeners for:
    - Order status changes (e.g., "Accepted", "In Production").
    - Inventory sync updates from external sources.
- [ ] **Core Schema Extensions:** Add custom fields to the `Product` and `Order` objects (e.g., `house_id`, `commission_rate`, `original_vendor_reference`).

## Phase 3: The Bridge (Integration and Communication)

*Goal: Define how the storefront talks to the engine efficiently.*

- [ ] **API Strategy:** Decide on a consistent communication contract between Frontend and Backend.
    - *Option A:* Medusa GraphQL (High flexibility for complex data fetching).
    - *Option B:* REST + Custom BFF (Backend for Frontend) layer if specific transformation is needed before reaching the frontend.
- [ ] **Dynamic Fetching:** Implement logic to handle multi-vendor inventory status (e.g., ensuring a product's stock check reflects only the relevant house).
- [ ] **Auth Integration:** Establish the standard between Customer, House, and Admin authentication flows.

## Phase 4: The Factory Workflow (Client Scaling)

*Goal: Define how to pivot from `medusa-poc` to a live client project.*

- [ ] **Template Deployment Pipeline:** Create a workflow where a new client is a "clone and swap."
- [ ] **Configuration Layer:** Separate the *Core Logic* from the *Brand Styling*.
    - Brand specifics (Colors, Copy, Images) should live in a config file or specialized theme layer, not deep in the core logic.
- [ ] **Onboarding Script:** Create a standard procedure for importing products/data from third parties into the new instance.
