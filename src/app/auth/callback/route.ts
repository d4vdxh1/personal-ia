import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = new URL("/", request.url);
  if (code && code.length < 2048) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(destination, { headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.redirect(new URL("/login?reason=oauth-error", request.url),
    { headers: { "Cache-Control": "private, no-store" } });
}
