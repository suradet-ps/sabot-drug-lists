# Sabot Drug Lists (Hospital Drug Formulary Management System)

[![Vue.js](https://img.shields.io/badge/Vue.js-35495E?logo=vuedotjs&logoColor=4FC08D)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Pinia](https://img.shields.io/badge/Pinia-FFD859?logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white)](https://eslint.org/)

A modern, comprehensive **Progressive Web Application (PWA)** for managing a hospital's drug formulary. Built with **Vue 3**, **Vite**, and **Supabase**, this system streamlines the process of viewing, searching, adding, editing, and decommissioning drugs from the hospital's official list.

## Key Features

- **Progressive Web App (PWA)**: Fully installable on desktop and mobile devices with offline capabilities and auto-updates.
- **Role-Based Access Control**: Secure access with distinct roles for **Administrators** (full CRUD access) and **Viewers** (read-only).
- **Full Drug Lifecycle Management**:
  - **Create**: Add new drugs to the formulary.
  - **Read**: Advanced search and filtering capabilities.
  - **Update**: Edit existing drug details.
  - **Decommission**: Move drugs to a historical archive with required justification.
  - **Recommission**: Restore drugs to the active list.
- **Activity Logging & Audit Trail**:
  - Track changes, user actions, and system statistics with a dedicated activity dashboard.
- **High Performance**:
  - **State Management**: Powered by [Pinia](https://pinia.vuejs.org/) for efficient and reactive data handling.
  - **Server-Side Pagination**: Optimized for handling large datasets without performance degradation.
  - **Instant Search**: Real-time filtering by drug code, trade name, generic name, or category.
- **Powerful Admin Tools**:
  - **Bulk CSV Import**: Rapidly populate or update the database using CSV files.
- **Modern UI/UX**:
  - **Responsive Design**: Built with [Tailwind CSS](https://tailwindcss.com/) for a mobile-first experience.
  - **Clean Iconography**: Using [Lucide Vue](https://lucide.dev/) for consistent and beautiful icons.
  - **Interactive Feedback**: Real-time toast notifications for user actions.

## Technology Stack

- **Frontend Framework**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **State Management**: [Pinia](https://pinia.vuejs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4)
- **Backend & Auth**: [Supabase](https://supabase.io/)
- **PWA Support**: [Vite PWA Plugin](https://vite-pwa-org.netlify.app/)
- **Icons**: [Lucide Vue](https://lucide.dev/)
- **CSV Parsing**: [PapaParse](https://www.papaparse.com/)
- **Linting**: [ESLint](https://eslint.org/) (Flat Config)
- **CI/CD**: GitHub Actions
- **Deployment**: [Vercel](https://vercel.com/) (Pre-configured SPA routing)

## Supabase Backend Setup

This project requires a Supabase project for its backend. Ensure your project has the following schema:

1. **`drugs` Table**:
   - `id` (uuid, PK)
   - `drug_code` (text)
   - `trade_name` (text)
   - `generic_name` (text)
   - `account` (text)
   - `price_opd` (numeric)
   - `category` (text)
   - `is_active` (boolean, default: `true`)
   - `remarks` (text)
   - `notes` (text)
   - `created_at` (timestamp)
   - `decommissioned_at` (timestamp)

2. **`drug_changelog` Table**:
   - `id` (uuid, PK)
   - `drug_id` (uuid, FK to `drugs.id`)
   - `action` (text)
   - `changed_by` (uuid, FK to `auth.users.id`)
   - `changed_at` (timestamp)

3. **`profiles_drugcupsabot` Table**:
   - `id` (uuid, FK to `auth.users.id`)
   - `role` (text: `'admin'` or `'viewer'`)

4. **Authentication**: Enable Email/Password authentication.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or newer)
- [Bun](https://bun.sh/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/suradet-ps/sabot-drug-lists.git
   cd sabot-drug-lists
   ```

2. **Install dependencies**

   ```bash
   bun install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:

   ```bash
   cp .env
   ```

   Update the `.env` file with your Supabase credentials:

   ```env
   VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
   VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
   ```

4. **Run Development Server**

   ```bash
   bun run dev
   ```

   The app will be available at `http://localhost:5173`.

### Building for Production

To create a production-ready build:

```bash
bun run build
```

The artifacts will be in the `dist/` directory.

## Project Structure

```text
src/
├── assets/          # Global styles (Tailwind) and static assets
├── components/      # Reusable Vue components (UI elements, Modals)
├── router/          # Vue Router configuration
├── services/        # API calls and external service logic
├── stores/          # Pinia state stores
├── views/           # Page-level components
├── App.vue          # Root component
├── main.js          # Application entry point
└── supabaseClient.js # Supabase client configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
