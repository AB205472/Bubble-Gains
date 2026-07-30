# Bubble Gains V6.2 — Bubble Vision 🫧

Bubble is a private, Supabase-backed daily AI companion and life-learning dashboard. Each Central Time calendar day has its own conversation. Chat messages persist throughout the day, older days are archived, meaningful updates feed memories and stats, and finalized `bubble_days` records remain the canonical daily summary.

## Bubble Vision

Bubble chat now supports private image input through the camera or photo library.

Supported flows:

- Meals and food labels
- Receipts
- Scale photos
- Treadmill, watch, and workout screens
- Progress photos without appearance judgments
- General image understanding

Images are previewed before sending, uploaded to a private Supabase Storage bucket, linked to the day's chat, analyzed through the OpenAI Responses API, and displayed as signed private image cards. Useful structured results include a one-tap **Save to Bubble** action that creates a normal Bubble memory and updates stats through the existing memory pipeline.

## Required Vercel environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `OPENAI_MODEL` — optional; defaults to `gpt-5-mini`

No new environment variables are required for Bubble Vision.

## Supabase

Bubble Vision adds:

- `bubble_attachments`
- private `bubble-uploads` Storage bucket
- ownership-based table and Storage RLS policies

Migration:

- `supabase/migrations/20260730_add_bubble_vision_attachments.sql`

## Verification

- Supabase migration applied to project `rkplselnjxvwjhlpbhpv`.
- `bubble_attachments` verified with RLS enabled.
- Vercel preview build completed successfully.
- Full signed-in camera and photo-library interaction should be smoke-tested from Alli's installed Bubble PWA after production deployment.

## Privacy

- Upload bucket is private.
- Signed URLs are temporary.
- File size is limited to 15 MB.
- Only supported image MIME types are accepted.
- Table and Storage access are restricted to the authenticated owner.
- The OpenAI API key remains server-only.
