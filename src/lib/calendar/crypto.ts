import { createCipheriv,createDecipheriv,randomBytes } from "node:crypto";

function keyFromBase64(keyString:string):Buffer{
  const key=Buffer.from(keyString,"base64");
  if(key.length!==32)throw new Error("Calendar encryption key must be 32 bytes.");
  return key;
}
export function encryptCalendarToken(token:string,userId:string,keyBase64:string):string{
  if(!token || token.length>3500)throw new Error("Invalid calendar token");
  const iv=randomBytes(12);
  const cipher=createCipheriv("aes-256-gcm",keyFromBase64(keyBase64),iv);
  cipher.setAAD(Buffer.from(userId));
  const bytes=Buffer.concat([cipher.update(token,"utf8"),cipher.final()]);
  return ["v1",iv.toString("base64url"),cipher.getAuthTag().toString("base64url"),
    bytes.toString("base64url")].join(".");
}
export function decryptCalendarToken(encrypted:string,userId:string,keyBase64:string):string{
  const parts=encrypted.split(".");
  if(parts.length!==4||parts[0]!=="v1")throw new Error("Invalid token format");
  const iv=Buffer.from(parts[1],"base64url"),tag=Buffer.from(parts[2],"base64url");
  if(iv.length!==12||tag.length!==16)throw new Error("Invalid token format");
  const decipher=createDecipheriv("aes-256-gcm",keyFromBase64(keyBase64),iv);
  decipher.setAAD(Buffer.from(userId));decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(Buffer.from(parts[3],"base64url")),decipher.final()]).toString("utf8");
}
