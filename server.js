import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Add this validation after dotenv.config()
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is required in .env file');
}

// Fastify + React + Vite configuration
const server = Fastify({
  logger: {
    transport: {
      target: "@fastify/one-line-logger",
    },
  },
});

// Configure Vite differently for production
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // Serve static files from dist directory in production
  await server.register(import('@fastify/static'), {
    root: join(__dirname, 'dist'),
    prefix: '/'
  });
} else {
  // Development mode with Vite
  await server.register(FastifyVite, {
    root: import.meta.url,
    renderer: "@fastify/react",
  });
  await server.vite.ready();
}

// Server-side API route to return an ephemeral realtime session token
server.get("/token", async () => {
  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse"
    }),
  });

  return new Response(r.body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
});

await server.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
