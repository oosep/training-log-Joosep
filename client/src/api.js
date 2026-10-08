import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL;

async function request(path, options = {}) {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session) {
    throw new Error('Guest session unavailable');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${data.session.access_token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${response.status})`);
  }

  // 204 DELETE vastusel pole keha, seega ära kutsu response.json()
  return response.status === 204 ? null : response.json();
}

export function getItems() {
  return request('/api/items');
}

export function addItem(item) {
  return request('/api/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
}

export function deleteItem(id) {
  return request(`/api/items/${id}`, { method: 'DELETE' });
}