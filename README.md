# Sabot Drug Lists

```
██████╗ ██████╗ ██╗   ██╗ ██████╗██╗     ██╗ ██████╗████████╗ ██████╗
██╔══██╗██╔══██╗██║   ██║██╔════╝██║     ██║██╔════╝╚══██╔══╝██╔════╝
██║  ██║██████╔╝██║   ██║██║  ███╗██║     ██║███████╗   ██║   ███████╗
██║  ██║██╔══██╗██║   ██║██║   ██║██║     ██║╚════██║   ██║   ╚════██║
██████╔╝██║  ██║╚██████╔╝╚██████╔╝███████╗██║██████╔╝   ██║   ██████╔╝
╚═════╝ ╚═╝  ╚═╝ ╚═════╝  ╚═════╝╚══════╝╚═╝╚═════╝   ╚═╝╚═════╝
```

---

## ◆ PULSE

A hospital formulary is a promise written in drug codes: what this
hospital stands behind, at what price, and whether it is still
dispensed. Sabot Drug Lists is the PWA that keeps that promise alive -
view, search, add, edit, decommission with justification, recommission,
and audit every change. Administrators hold the pen, viewers hold the
list, and the changelog holds everyone accountable. Installable,
offline-capable, searchable at the speed of typing.

| Lifecycle ▣ | Roles ▣ | Audit ▣ | PWA ▣ |
|---|---|---|---|

*The formulary loop - manage, justify, audit, restore - is sealed.*

> Built with Vue 3 + Pinia + Tailwind 4, backed by Supabase, shipped
> as an installable PWA to Vercel.
>
> **suradet-ps**, artifact keeper

---

## ◆ IGNITION

One runtime, four commands.

```
⟫ git clone https://github.com/suradet-ps/sabot-drug-lists.git
⟫ cd sabot-drug-lists
⟫ bun install
⟫ cp .env
⟫ bun run dev
```

Open [http://localhost:5173](http://localhost:5173).

The release artifact: `⟫ bun run build` - output in `dist/`.

<details>
<summary>Supabase setup</summary>

The backend needs three objects (see `schema.sql`):

- `drugs` - the formulary: code, trade and generic names, account,
  OPD price, category, active flag, remarks, notes, and
  decommissioned-at timestamps.
- `drug_changelog` - every action with its actor and timestamp.
- `profiles_drugcupsabot` - the role table: `admin` or `viewer`.

Enable Email/Password authentication; the anon key goes in `.env`:

```
VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

</details>

---

## ◆ ANATOMY

One list, two roles, a changelog that never blinks.

- **Lists** - server-side pagination keeps the formulary fast at any
  size; instant search filters by drug code, trade name, generic name,
  or category as you type.
- **Manages** - the full lifecycle in one place: create, edit,
  decommission into the historical archive with a required
  justification, and recommission back into the active list.
- **Gates** - role-based access: administrators hold full CRUD,
  viewers hold read-only. The pen is never in both hands at once.
- **Audits** - every change lands in `drug_changelog`; the activity
  dashboard turns it into the record a pharmacy review can read.
- **Imports** - bulk CSV import populates or updates the database in
  one pass - a formulary migration without a thousand forms.
- **Works anywhere** - an installable PWA with offline capability and
  auto-updates; toast feedback for every action, responsive to every
  screen.

---

## ◆ RITUALS

**The core ceremony** - one drug's journey:

1. Search by code, name, or category. The list answers as you type.
2. Edit or create: the form takes the details, the toast confirms.
3. Decommission when the drug leaves the list - the justification is
   required before the archive accepts it.
4. Audit: the activity dashboard shows who moved what, and when. A
   recommission later brings the drug back with the history intact.

**The ceremony of the justification** - no drug disappears silently.
Decommissioning demands a reason, and the reason becomes part of the
record - the archive remembers why, not just that.

**The ceremony of the changelog** - every action has an actor and a
timestamp. The formulary may change hands, but it never changes
without a trace.

---

## ◆ ECHOES

**Where this artifact is heading**

```
list     ▸ paginated formulary, instant multi-field search ─────────── ▸ sealed
lifecycle ▸ create, edit, decommission, recommission ────────────────── ▸ sealed
roles    ▸ admin CRUD vs viewer read-only ──────────────────────────── ▸ sealed
audit    ▸ changelog + activity dashboard ──────────────────────────── ▸ sealed
import   ▸ bulk CSV ────────────────────────────────────────────────── ▸ sealed
offline  ▸ installable PWA, auto-updates ────────────────────────────── ▸ sealed
```

**Raising the artifact** - the schema is `schema.sql`; the
contribution rules live in `CONTRIBUTING.md`; the security posture in
`SECURITY.md`. Open an issue first to discuss a change.

**Status** - CI gates every push on the way to Vercel.
[Watch the gates](.github/workflows).

---

```
  ─────────────────────────────────────────
   A formulary without a changelog
   is a promise without a memory.
  ─────────────────────────────────────────
```

Distributed under the [MIT License](LICENSE).