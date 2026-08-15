// Serverless adapter: Vercel sends every /api/* request to the existing
// Express application instead of serving the React index.html.
import app from '../server/src/server.js';

export default app;
