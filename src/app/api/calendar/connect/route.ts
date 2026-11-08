import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { calendarConfig,CALENDAR_SCOPE,CALENDAR_EVENTS_SCOPE } from "@/lib/calendar/config";

export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(request:NextRequest){
  const client=await createClient();
  const {data,error}=await client.auth.getUser();
  if(error||!data.user)return NextResponse.redirect(new URL("/login",request.url));
  const config=calendarConfig();
  if(!config||new URL(config.redirectUri).origin!==request.nextUrl.origin)
    return NextResponse.redirect(new URL("/calendar?status=unconfigured",request.url));
  const writeMode=request.nextUrl.searchParams.get("mode")==="write" && process.env.GOOGLE_CALENDAR_WRITE_ENABLED==="true";
  const state=randomBytes(32).toString("base64url");
  const cookieStore=await cookies();
  cookieStore.set("calendar_oauth_state",state+"."+data.user.id+"."+(writeMode?"write":"read"),{
    httpOnly:true,secure:request.nextUrl.protocol==="https:",sameSite:"lax",
    maxAge:600,path:"/api/calendar/callback",
  });
  const url=new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id",config.clientId);
  url.searchParams.set("redirect_uri",config.redirectUri);
  url.searchParams.set("response_type","code");
  url.searchParams.set("scope",writeMode ? CALENDAR_SCOPE+" "+CALENDAR_EVENTS_SCOPE : CALENDAR_SCOPE);
  url.searchParams.set("access_type","offline");
  url.searchParams.set("prompt","consent");
  url.searchParams.set("include_granted_scopes","true");
  url.searchParams.set("state",state);
  return NextResponse.redirect(url);
}
