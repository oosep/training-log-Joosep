import express from 'express';
import cors from 'cors';
import { itemsRouter } from './items.js';

export const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/items', itemsRouter);

// Tundmatu marsruut
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Vigade käsitleja: kliendile ainult üldine teade
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body too large' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});