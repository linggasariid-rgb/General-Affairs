import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { errorHandler } from './midlware/error';
import router from './api/router';
import type { AppEnv } from './config/database';

const app = new Hono<AppEnv>();

// Global middleware
app.use('*', cors({
  origin: ['http://localhost:5173', 'http://localhost:8787', 'https://ga-enterprise.pages.dev'],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
}));
app.use('*', errorHandler);

// API routes
app.route('/api/v1', router);

// Root
app.get('/', (c) => c.json({
  app: 'GA Enterprise API',
  version: '1.0.0',
  status: 'running',
}));

export default app;
