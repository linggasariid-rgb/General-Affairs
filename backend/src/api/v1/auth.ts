import { Hono } from 'hono';
import type { AppEnv } from '../../config/database';

const app = new Hono<AppEnv>();

export default app;
