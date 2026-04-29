import express from 'express';
import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  getDb,
  getSessions,
  getSessionById,
  getPatterns,
  getKPIs,
  updateQuality,
} from '../recorder/db.js';
import { estimateTokens } from '../estimator/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', '..', '..', '..', 'templates');
const DIST_DIR = join(__dirname, '..', '..', '..', 'dashboard', 'dist');

export function createApp(): express.Application {
  const app = express();
  const db = getDb();

  app.use(express.json());
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });

  app.get('/api/sessions', (req, res) => {
    const limit = parseInt(String(req.query['limit'] ?? '50'), 10);
    const sessions = getSessions(db, isNaN(limit) ? 50 : limit);
    res.json(sessions);
  });

  app.get('/api/sessions/:id', (req, res) => {
    const session = getSessionById(db, req.params['id'] ?? '');
    if (!session) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json(session);
  });

  app.get('/api/patterns', (_req, res) => {
    res.json(getPatterns(db));
  });

  app.get('/api/kpis', (_req, res) => {
    res.json(getKPIs(db));
  });

  app.get('/api/templates', async (_req, res) => {
    try {
      const files = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith('.md'));
      const templates = await Promise.all(
        files.map(async (f) => {
          const content = readFileSync(join(TEMPLATES_DIR, f), 'utf-8');
          const tokenCount = await estimateTokens(content);
          return { name: f.replace('.md', ''), content, tokenCount };
        })
      );
      res.json(templates);
    } catch {
      res.json([]);
    }
  });

  app.post('/api/sessions/:id/quality', (req, res) => {
    const { quality } = req.body as { quality?: unknown };
    if (typeof quality !== 'number' || !Number.isInteger(quality) || quality < 1 || quality > 5) {
      res.status(400).json({ error: 'quality must be an integer between 1 and 5' });
      return;
    }
    const updated = updateQuality(db, req.params['id'] ?? '', quality);
    if (!updated) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ success: true });
  });

  try {
    app.use(express.static(DIST_DIR));
    app.get('*', (_req, res) => {
      res.sendFile(join(DIST_DIR, 'index.html'));
    });
  } catch {
    // dashboard dist not built yet
  }

  return app;
}
