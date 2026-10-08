import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ensureGuestSession } from './supabase';
import { addItem, deleteItem, getItems } from './api';

export default function App() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exercise, setExercise] = useState('');
  const [repetitions, setRepetitions] = useState('');
  const [formError, setFormError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        await ensureGuestSession();
        const data = await getItems();
        if (!ignore) setItems(data);
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = exercise.trim();
    const reps = Number(repetitions);

    if (trimmed.length < 1 || trimmed.length > 60) {
      setFormError('Exercise must be 1–60 characters.');
      return;
    }
    if (!Number.isInteger(reps) || reps < 1 || reps > 500) {
      setFormError('Repetitions must be a whole number from 1 to 500.');
      return;
    }

    try {
      setFormError('');
      const created = await addItem({ exercise: trimmed, repetitions: reps });
      setItems((prev) => [created, ...prev]);
      setExercise('');
      setRepetitions('');
    } catch (err) {
      setFormError(err.message);
    }
  }

  async function handleDelete(id) {
    try {
      setError('');
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  const query = search.trim().toLowerCase();
  const visibleItems = items.filter((item) =>
    item.exercise.toLowerCase().includes(query)
  );
  const totalReps = visibleItems.reduce((sum, item) => sum + item.repetitions, 0);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Training Log
      </Typography>

      <Stack component="form" onSubmit={handleSubmit} noValidate spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Exercise"
          value={exercise}
          onChange={(e) => setExercise(e.target.value)}
          slotProps={{ htmlInput: { maxLength: 60 } }}
        />
        <TextField
          label="Repetitions"
          type="number"
          value={repetitions}
          onChange={(e) => setRepetitions(e.target.value)}
          slotProps={{ htmlInput: { min: 1, max: 500 } }}
        />
        {formError && <Alert severity="warning">{formError}</Alert>}
        <Button type="submit" variant="contained" disabled={loading}>
          Save
        </Button>
      </Stack>

      <TextField
        label="Search by exercise"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      {visibleItems.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Records: {visibleItems.length} · Total reps: {totalReps}
        </Typography>
      )}

      {loading && <Alert severity="info">Loading...</Alert>}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && visibleItems.length === 0 && (
        <Alert severity="info">No records found.</Alert>
      )}

      <Stack spacing={1}>
        {visibleItems.map((item) => (
          <Card key={item.id}>
            <CardContent
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography>
                {item.exercise} — {item.repetitions} reps
              </Typography>
              <Button color="error" onClick={() => handleDelete(item.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}