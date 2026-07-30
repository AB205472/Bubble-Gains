# Bubble Gains V6 🫧

Bubble is a private, Supabase-backed daily AI companion and life-learning dashboard. Each Central Time calendar day has its own conversation. Chat messages persist throughout the day, older days are archived, meaningful updates feed memories and stats, and finalized `bubble_days` records remain the canonical daily summary.

## V6 fixes and hardening

- Fixed the production chat failure: `"undefined" is not valid JSON`.
- Parses the raw REST response from OpenAI's Responses API instead of assuming the SDK-only `output_text` convenience property exists.
- Supports structured JSON output, refusals, incomplete responses, malformed output, and non-JSON HTTP errors.
- Keeps a user's message saved when the AI connection has a temporary failure and returns a non-crashing degraded response.
- Prevents API failures from producing duplicate user messages on retry.
- Uses a defensive frontend JSON reader for `/api/chat` and `/api/parse`.
- Preserves Central Time daily chat grouping and automatic archival after midnight.
- Preserves canonical `bubble_days` totals so finalized days do not double-count earlier check-ins.
- Includes `/api/health`, which reports whether OpenAI and Supabase environment variables are configured without exposing their values.
- Contains no avatar asset files.

## Required Vercel environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` — optional; defaults to `gpt-5-mini`

After deployment, open `/api/health`. A healthy deployment returns status 200 with both services marked `configured`. The endpoint never returns secret values.

## Supabase

The live Bubble Gains project was checked against the code. These tables and their row-level-security policies are present:

- `memories`
- `bubble_days`
- `bubble_chat_days`
- `bubble_chat_messages`
- `profiles`
- `app_settings`

The included migrations remain in the repository for schema history. Do not re-create the tables manually.

## Local verification

```bash
npm install
npm test
npm run build
npm run dev
```

Then test:

1. Sign in.
2. Send a chat message and refresh; both sides of the conversation should remain.
3. Send a food update; today's calories and protein should update.
4. Open a finalized date; its nutrition values should override, not add to, individual check-ins.
5. Visit `/api/health`.

## Deployment

Commit the full V6 repository or apply the V6 update bundle, push to GitHub, and let Vercel deploy. Existing Supabase data is not replaced by these files.

## V6.1 mobile installation update

This package includes a complete web-app manifest, 192px and 512px install icons, an Apple touch icon, and a small production service worker. After the Vercel production deployment succeeds, open the site in Safari on iPhone, tap Share, and choose **Add to Home Screen**.

## Verified data backfill

The production Supabase project was backfilled for July 26, July 28, July 29, and the partial July 30 entry. The existing finalized July 27 entry was preserved.
