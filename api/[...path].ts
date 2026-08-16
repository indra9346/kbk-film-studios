// Serverless adapter: Vercel sends every /api/* request to the built
// Express application. Import the compiled server output so the deployed
// /api/owner/check-access route resolves correctly.
import app from '../server/dist/server.js';

export default app;
