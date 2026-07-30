import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
  const openaiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return NextResponse.json({
    ok: openaiConfigured && supabaseConfigured,
    version: "6.0.0",
    services: {
      openai: openaiConfigured ? "configured" : "missing",
      supabase: supabaseConfigured ? "configured" : "missing"
    }
  }, { status: openaiConfigured && supabaseConfigured ? 200 : 503 });
}
