# Odonto Vértice — Delivery Plan

## Architecture

- **Next.js 16 App Router** with Cache Components. Public catalog pages are prerendered from the
  database with `use cache` + `cacheTag('catalog')`; booking availability and the clinic panel stream
  behind `<Suspense>`.
- **Domain modules** under `src/modules`:
  - `schedule` — weekly schedules, holidays, blocks and the pure availability engine.
  - `booking` — booking, cancel and reschedule use cases, manage tokens, Zod schemas.
  - `patients` — patient identity and contact validation.
  - `admin` — staff session, roles, agenda queries.
  - `notifications` — channel interface (email now, WhatsApp later) and reminder dispatch.
  - `catalog` — treatments and dentists for the public site.
- **Trust boundary**: every rule runs on the server. Server Actions validate with Zod, recompute
  availability and only then write. The browser never talks to Supabase directly.
- **Database as the last line of defence**: an exclusion constraint on
  `(dentist_id WITH =, period WITH &&)` makes double booking impossible, even under concurrency.

## Data model

| Table                     | Purpose                                                             |
| ------------------------- | ------------------------------------------------------------------- |
| `dentists`                | Profile, specialty, CRO-GO, technical lead flag                     |
| `treatments`              | Slug, name, duration, public copy                                   |
| `dentist_treatments`      | Which dentist performs which treatment                              |
| `weekly_schedules`        | Working hours per weekday with lunch break                          |
| `holidays`                | Clinic-wide closed dates                                            |
| `schedule_blocks`         | Manual blocks (`tstzrange`) per dentist                             |
| `patients`                | Name, e-mail, phone, insurance                                      |
| `appointments`            | `tstzrange` period, status, manage token hash, exclusion constraint |
| `staff_profiles`          | Auth user → role (`reception` / `dentist`) and dentist link         |
| `notification_deliveries` | One row per (appointment, kind): idempotent reminders               |

## Pages

- `/` home · `/tratamentos/[slug]` · `/equipe/[slug]`
- `/agendar` multi-step flow driven by search params (server-rendered steps)
- `/agendamento/[token]` confirmation, cancel and reschedule without login
- `/painel` login, day and week agenda, blocks, reschedule and cancel

## Design system

- Warm off-white paper, deep green primary, a single terracotta accent.
- Newsreader (serif, display) + Hanken Grotesk (sans, body) via `next/font`.
- Real photography from Unsplash, credited in the README.
- Editorial layouts with varied section composition; no default component-library look.

## Phases

0. Plan and scaffold (strict TS, Tailwind, Vitest, Playwright, Prettier)
1. Database: schema, exclusion constraint, RLS, functions, seed, DB tests
2. Availability engine and domain modules with unit tests
3. Design system and public site with local SEO
4. Booking flow and manage link
5. Clinic panel
6. Reminders and notification channels
7. E2E tests, CI, Lighthouse, README, deploy
