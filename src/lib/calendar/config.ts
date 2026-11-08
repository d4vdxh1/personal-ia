import "server-only";
export const CALENDAR_SCOPE="https://www.googleapis.com/auth/calendar.readonly";
export function calendarConfig(){
  const clientId=process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret=process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const tokenKey=process.env.GOOGLE_CALENDAR_TOKEN_KEY;
  const redirectUri=process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if(!clientId||!clientSecret||!tokenKey||!redirectUri) return null;
  if(!/^https:\/\/[\w.-]+\/api\/calendar\/callback$/.test(redirectUri))return null;
  if(Buffer.from(tokenKey,"base64").length!==32)return null;
  return {clientId,clientSecret,tokenKey,redirectUri};
}
