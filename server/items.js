import { Router } from 'express';
import { requireGuest } from './auth.js';

export const itemsRouter = Router();

// Iga /api/items päring vajab kehtivat külalise JWT-d
itemsRouter.use(requireGuest);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const COLUMNS = 'id, exercise, repetitions, created_at';

function validateItem(body) {
  const { exercise, repetitions } = body ?? {};

  if (typeof exercise !== 'string') {
    return { error: 'Exercise must be text' };
  }
  const trimmed = exercise.trim();
  if (trimmed.length < 1 || trimmed.length > 60) {
    return { error: 'Exercise must be 1–60 characters' };
  }
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 500) {
    return { error: 'Repetitions must be a whole number from 1 to 500' };
  }
  return { exercise: trimmed, repetitions };
}

// GET /api/items – külalise enda kirjed, uuemad eespool
itemsRouter.get('/', async (req, res, next) => {
  const { data, error } = await req.db
    .from('items')
    .select(COLUMNS)
    .eq('owner_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) return next(error);
  res.status(200).json(data);
});

// POST /api/items – uus kirje
itemsRouter.post('/', async (req, res, next) => {
  const result = validateItem(req.body);
  if (result.error) {
    return res.status(400).json({ error: result.error });
  }

  // Ainult lubatud väljad – mitte kogu req.body
  const { data, error } = await req.db
    .from('items')
    .insert({
      exercise: result.exercise,
      repetitions: result.repetitions,
      owner_id: req.user.id,
    })
    .select(COLUMNS)
    .single();

  if (error) return next(error);
  res.status(201).json(data);
});

// DELETE /api/items/:id – kustutab ainult enda kirje
itemsRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  if (!UUID_PATTERN.test(id)) {
    return res.status(400).json({ error: 'Invalid record id' });
  }

  const { data, error } = await req.db
    .from('items')
    .delete()
    .eq('id', id)
    .eq('owner_id', req.user.id)
    .select('id');

  if (error) return next(error);
  if (data.length === 0) {
    return res.status(404).json({ error: 'Record not found' });
  }
  res.status(204).end();
});