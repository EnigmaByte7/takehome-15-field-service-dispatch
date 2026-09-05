# Submission

Fill this in and commit it. This is the first file we open.

## Links

- **GitHub repository:** : https://github.com/EnigmaByte7/takehome-15-field-service-dispatch
- **Live application:** : https://takehome-15-field-service-dispatch.vercel.app/login

## Notes for the reviewer

Backend is on a free tier that sleeps after inactivity; first request can take up to a minute to wake it. If the app looks stuck on first load, wait 60s and refresh.

another note for the reviewer : ) , please read plan.md i have explained there about each modules working and implementation, and in decision.md i have added explaination for key decisions, including the no double booking logic

## Demo credentials

Seed data includes 1 dispatcher and 2 technicians with demo jobs i used for testing so the dashboard and job list aren't empty on first look.

| Role | Email | Password |
|------|-------|----------|
| Dispatcher | dispatcher@demo.com | password123 |
| Technician | priya@demo.com | password123 |
| Technician | sam@demo.com | password123 |

Login page has a autofill button ,so no need to copy paste creds

## Stack

| Layer | What you used | Why |
|-------|---------------|-----|
| Frontend | React + Vite, Tailwind CSS, TanStack Query | Data is relational and role scoped, and Tanstack Query helps in server state caching,fetching data and synchronizing |
| Backend | Node + Express, controller → service → repository layering | Keeps role enforcement, business rules, and data access in separate layers so each one has one job — easier to understand and implement |
| Database | PostgreSQL (Neon) via Prisma (free) | The data has real many-to-many relationships (technicians ↔ jobs via Assignment) and needed a DB-level constraint (EXCLUDE) that only a relational DB supports. |
| Hosting | Neon (DB) + Render (API) + Vercel (frontend)> | Simple and fast deployment, directly from the github repo, and generous free tier too|

## Goal checklist

Mark each honestly. Partial is fine — say what is partial.

 
| # | Goal | Status | Notes |
|---|------|--------|-------|
| 1 | Accounts and roles | Done | JWT auth, `dispatcher`/`technician` roles, enforced server-side via `requireRole()` middleware on every route that needs it, not just hidden in the UI. |
| 2 | Jobs (CRUD) | Partial | Create, get, list, update (edit modal), archive/restore (soft delete via `archivedAt`, toggle in the UI).The only thing missing in this module, is the ability to change the schedule of a job rest all is fine |
| 3 | Parts used | Done | Parts can be added to a job before completion and are shown on the job detail page. Gets logged as a timeline event in the job details page |
| 4 | Job lifecycle with rules | Done | Explicit transition table (`Unassigned → Assigned → En Route → On Site → Completed`), illegal moves rejected server-side with a reason. Completion requires a note + at least one part. |
| 5 | Assignment (no double-booking) | Done | Assigning a technician checks and rejects overlaps (app-level check + DB `EXCLUDE` constraint as a hard backstop).A Known gap: editing a job's schedule (date/time/duration) on an already-assigned job does not re-check for new overlaps against the updated window — only the initial assignment is protected, not a later reschedule |
| 6 | Finding jobs | Done | Server-side search (customer/address), filters (status, technician, date, archived), sorting, pagination with total count. |
| 7 | Bulk actions | Done | Bulk-assign reports per-job success/failure rather than failing the whole batch. CSV export of a chosen day's dispatch sheet. |
| 8 | Dashboard | Done | Scheduled/completed/late/unassigned counts, breakdown by status and technician, 14-day completion chart raw SQL query`date_trunc` for the day grouping, since Prisma has no native truncation,  read about in plan.md. |
| 9 | Immutable history | Done | `JobEvent` is append-only — no update/delete endpoint exists at any role. Records creation, status changes, assign/unassign, completion on the job, job update or edit however is NOT logged as of now |
| 10 | Running-late alerts | Partial | Alerts computed lazily on `GET /alerts` by comparing each active job's window against now. Alert can be marked as Dismissed to set dismissed_at, for now alerts are NOT created for rescheduled job windows |
 

## How much time did you actually spend?

about 16+ hours , extra time was spent on fixing bugs and also due to my bad health at the time of working on it

## What would you do next, with another 12 hours?

with some additional time, i will work on the reschedule job feature, that i left out as of now, that will eventually give way to fix the alert on rescheduled jobs too, 

another feature i wanted to implement from my personal pov, is that the ability to see the entire schedule of any technician, all assigned jobs in the form of a gantt chart and timeline, can be useful for a dispatcher too


## What are you least happy with in this codebase, and why?

right now the job reschedule is not implemented so thats a gap, because of that, alerts are also not created for rescheduled jobs, so that can be fixed

apart from that, there is a lack of proper input / output validation in frontend using like zod, 

the auth token gets saved directly into localstorage, ok for a prototype, but can later use cookies, and also work on refresh tokens

there are no test files as of now