#!/usr/bin/env node
import('../dist/index.js').catch((err) => {
  console.error('Failed to start tburn:', err.message);
  process.exit(1);
});
