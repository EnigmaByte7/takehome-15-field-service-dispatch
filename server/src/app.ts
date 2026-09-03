import express from 'express';
import cors from 'cors';
import authRoutes from './modules/auth/auth.routes.js';
import jobsRoutes from './modules/jobs/jobs.routes.js';
import eventsRoutes from './modules/events/events.routes.js'
import partsRoutes from './modules/parts/parts.routes.js';
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes)
app.use('/api/jobs/:jobId/parts', partsRoutes);
app.use('/api/jobs/:jobId/events', eventsRoutes)

export default app;
