// API kontrollid. Käivita, kui server töötab: npm run check
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const API = `http://localhost:${process.env.PORT || 3000}/api/items`;

async function newGuestToken() {
  const client = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  const { data, error } = await client.auth.signInAnonymously();
  if (error) throw error;
  return data.session.access_token;
}

function call(method, url, token, body) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  return fetch(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function check(name, actual, expected) {
  const mark = actual === expected ? 'OK  ' : 'FAIL';
  console.log(`${mark} ${name}: got ${actual}, expected ${expected}`);
}

const guestA = await newGuestToken();
const guestB = await newGuestToken();

check('GET without JWT', (await call('GET', API)).status, 401);
check('GET with fake JWT', (await call('GET', API, 'fake-token')).status, 401);
check('POST blank exercise', (await call('POST', API, guestA, { exercise: '   ', repetitions: 10 })).status, 400);
check('POST 61-char exercise', (await call('POST', API, guestA, { exercise: 'x'.repeat(61), repetitions: 10 })).status, 400);
check('POST 0 repetitions', (await call('POST', API, guestA, { exercise: 'Squats', repetitions: 0 })).status, 400);
check('POST 501 repetitions', (await call('POST', API, guestA, { exercise: 'Squats', repetitions: 501 })).status, 400);
check('POST repetitions as text', (await call('POST', API, guestA, { exercise: 'Squats', repetitions: '10' })).status, 400);

const created = await call('POST', API, guestA, { exercise: 'Push-ups', repetitions: 20 });
check('POST valid record', created.status, 201);
const record = await created.json();

const listA = await (await call('GET', API, guestA)).json();
check('Guest A sees own record', listA.some((r) => r.id === record.id), true);

const listB = await (await call('GET', API, guestB)).json();
check("Guest B sees A's record", listB.some((r) => r.id === record.id), false);

check("Guest B deletes A's record", (await call('DELETE', `${API}/${record.id}`, guestB)).status, 404);
check('Guest A deletes own record', (await call('DELETE', `${API}/${record.id}`, guestA)).status, 204);
check('Delete same record again', (await call('DELETE', `${API}/${record.id}`, guestA)).status, 404);