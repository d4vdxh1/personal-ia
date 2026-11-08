import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function GET() {
  const publicKey = process.env.WEB_PUSH_VAPID_PUBLIC_KEY;
  return NextResponse.json(
    { publicKey: publicKey && /^[A-Za-z0-9_-]{80,100}$/.test(publicKey) ? publicKey : null },
    {headers:{"Cache-Control":"no-store"}}
  );
}
