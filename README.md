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

## Local verification

```bash
npm install
npm test
npm run build
npm run dev
```

Then test:

1. Sign in.
2. Open Chat.
3. Take or choose a photo.
4. Verify the preview before sending.
5. Send with or without a caption.
6. Confirm Bubble analyzes the image and the photo card appears.
7. Tap **Save to Bubble** and verify the result appears in memories and stats.
8. Refresh and confirm the chat and photo card persist.
9. Visit `/api/health`.

## Privacy

- Upload bucket is private.
- Signed URLs are temporary.
- File size is limited to 15 MB.
- Only supported image MIME types are accepted.
- Table and Storage access are restricted to the authenticated owner.
- The OpenAI API key remains server-only.
