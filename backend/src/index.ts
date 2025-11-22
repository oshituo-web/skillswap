import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRouter from './routes/user'; // User Dashboard Routes
import adminRouter from './routes/admin'; // Admin Dashboard Routes
import auditRouter from './routes/audit'; // Audit Log Routes
import webhookRouter from './routes/webhook'; // Webhook Routes (for Resend/Supabase)
import skillsRouter from './routes/skills';
import exchangesRouter from './routes/exchanges';
import errorHandler from './middleware/errorHandler'; // Import the error handler

dotenv.config();

// CORS configuration (Manual override due to npm environment issue)
const corsOptions = {
  // Allow requests from Vite dev server and the final Vercel deployment
  origin: ['http://localhost:5173', process.env.FRONTEND_URL || ''], // Replace '' with your Vercel frontend URL 
  optionsSuccessStatus: 200
};

const app = express();
app.use(express.json()); // Middleware to parse JSON body
app.use(cors(corsOptions)); // Apply CORS middleware

const port = process.env.PORT || 3000;

// === ROUTER INTEGRATION ===
app.use('/api/user', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin', auditRouter); // Audit logs under /api/admin/audit-logs
app.use('/api/webhooks', webhookRouter); // <-- NEW WEBHOOK ROUTER
app.use('/api/skills', skillsRouter);
app.use('/api/exchanges', exchangesRouter);

// Basic health check route
app.get('/', (req, res) => {
  res.json({ message: 'Server is running successfully!' });
});

// Global error handling middleware - MUST be last
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});