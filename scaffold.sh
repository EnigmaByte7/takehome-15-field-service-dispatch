#!/bin/bash
set -e

echo "== Creating server structure =="
mkdir -p server/src/modules/auth
mkdir -p server/src/modules/jobs
mkdir -p server/src/modules/assignments
mkdir -p server/src/modules/parts
mkdir -p server/src/modules/events
mkdir -p server/src/modules/alerts
mkdir -p server/src/modules/dashboard
mkdir -p server/src/middleware
mkdir -p server/src/lib
mkdir -p server/src/db
mkdir -p server/tests
mkdir -p server/prisma

touch server/src/modules/auth/auth.controller.ts
touch server/src/modules/auth/auth.service.ts
touch server/src/modules/auth/auth.repository.ts
touch server/src/modules/auth/auth.routes.ts

touch server/src/modules/jobs/jobs.controller.ts
touch server/src/modules/jobs/jobs.service.ts
touch server/src/modules/jobs/jobs.repository.ts
touch server/src/modules/jobs/jobs.routes.ts

touch server/src/modules/assignments/assignments.controller.ts
touch server/src/modules/assignments/assignments.service.ts
touch server/src/modules/assignments/assignments.repository.ts
touch server/src/modules/assignments/assignments.routes.ts

touch server/src/modules/parts/parts.controller.ts
touch server/src/modules/parts/parts.service.ts
touch server/src/modules/parts/parts.repository.ts
touch server/src/modules/parts/parts.routes.ts

touch server/src/modules/events/events.service.ts
touch server/src/modules/events/events.repository.ts

touch server/src/modules/alerts/alerts.controller.ts
touch server/src/modules/alerts/alerts.service.ts
touch server/src/modules/alerts/alerts.repository.ts
touch server/src/modules/alerts/alerts.routes.ts

touch server/src/modules/dashboard/dashboard.controller.ts
touch server/src/modules/dashboard/dashboard.service.ts
touch server/src/modules/dashboard/dashboard.repository.ts
touch server/src/modules/dashboard/dashboard.routes.ts

touch server/src/middleware/auth.ts
touch server/src/middleware/requireRole.ts
touch server/src/lib/dateOverlap.ts
touch server/src/db/client.ts
touch server/src/app.ts
touch server/src/index.ts
touch server/tests/dateOverlap.test.ts

echo "== Setting up server package.json + deps =="
cd server
npm init -y
npm install express cors dotenv bcrypt jsonwebtoken @prisma/client
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken prisma vitest
npx tsc --init
npx prisma init
cd ..

echo "== Creating client (Vite + React + TS) =="
npm create vite@latest client -- --template react-ts
cd client
npm install
npm install @tanstack/react-query react-router-dom
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

mkdir -p src/api
mkdir -p src/queries
mkdir -p src/components
mkdir -p src/pages
mkdir -p src/context

touch src/api/client.ts
touch src/api/jobs.ts
touch src/api/assignments.ts
touch src/api/dashboard.ts

touch src/queries/useJobs.ts
touch src/queries/useJob.ts
touch src/queries/useAssignJob.ts
touch src/queries/useDashboard.ts

touch src/components/JobTable.tsx
touch src/components/JobDetail.tsx
touch src/components/Timeline.tsx
touch src/components/AlertBadge.tsx

touch src/pages/LoginPage.tsx
touch src/pages/DashboardPage.tsx
touch src/pages/JobsPage.tsx
touch src/pages/MyJobsPage.tsx

touch src/context/AuthContext.tsx
cd ..

echo "== Done. Folder structure and base deps are set up. =="
echo "Next: fill in server/prisma/schema.prisma, then run 'npx prisma migrate dev' from server/."