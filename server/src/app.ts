import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import jobsRoutes from './modules/jobs/jobs.routes.js';
import partsRoutes from './modules/parts/parts.routes.js';
import assignmentsRoutes from './modules/assignments/assignments.routes.js';
import eventsRoutes from './modules/events/events.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import technicianRoutes from './modules/users/users.routes.js'
import alertsRoutes from './modules/alerts/alerts.routes.js'

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/jobs/:jobId/parts', partsRoutes);
app.use('/api/jobs/:jobId/assignments', assignmentsRoutes);
app.use('/api/jobs/:jobId/events', eventsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users/', technicianRoutes);
app.use('/api/alerts', alertsRoutes);
//added a health endpoint
app.get('/', (req, res) => res.status(200).send("Server Running..."))

export default app;