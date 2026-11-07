import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash");
  const code = params.get("code");
  const type = params.get("type");
  const client = await createClient();
  let success = false;
  if (code && code.length < 2048) {
    const { error } = await client.auth.exchangeCodeForSession(code);
    success = !error;
  } else if (tokenHash && tokenHash.length < 2048 && (type === "email" || type === "recovery")) {
    const { error } = await client.auth.verifyOtp({ type, token_hash: tokenHash });
    success = !error;
  }
  const destination = success ? (type === "recovery" ? "/reset-password" : "/") :
    "/login?reason=confirmation-error";
  return NextResponse.redirect(new URL(destination, request.url),
    { headers: { "Cache-Control": "private, no-store" } });
}
