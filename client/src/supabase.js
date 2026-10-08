import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

let sessionPromise;

// Loob külalissessiooni ainult üks kord (ka siis, kui StrictMode käivitab efekti kaks korda)
export function ensureGuestSession() {
  sessionPromise ??= createOrReuseSession().catch((error) => {
    sessionPromise = undefined;
    throw error;
  });
  return sessionPromise;
}

async function createOrReuseSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) throw error;
  if (data.session) return data.session;

  const result = await supabase.auth.signInAnonymously();

  if (result.error) throw result.error;
  if (!result.data.session) throw new Error('Guest session unavailable');

  return result.data.session;
}