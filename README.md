# training-log-Joosep

**12. Training Log — Exercise Tracker**

Problem: You cannot remember what you practised.

Fields:
- exercise: 1–60 characters
- repetitions: integer from 1 to 500

Build: Add, list and delete exercise records.
Small extra: Search by exercise name.
Demo: Show only records matching one exercise.

API: https://fxqrohkrwcysxlwgquzj.supabase.co/rest/v1/

```
SUPABASE_URL=https://fxqrohkrwcysxlwgquzj.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_BhfMj2tKZ5PxUff7hHF4dQ_xhPTlNY_
```

Slides + demo video: https://docs.google.com/presentation/d/1eSNEE-1oDHZ5FNZLN9pWjnys3x9lMSIVwQIp4Bwbfto/edit?usp=sharing

Run: `cd server` → `npm install` → `npm run dev`, then `cd client` → `npm install` → `npm run dev` → http://localhost:5173

Done: add, list, delete, search, validation, JWT, RLS. Not done: editing, deployment.