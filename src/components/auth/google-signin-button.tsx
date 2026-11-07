"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setPending(true);
    setError("");
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" },
      });
      if (oauthError) throw oauthError;
    } catch {
      setError("No pudimos conectar con Google. Comprobá que el acceso esté habilitado.");
      setPending(false);
    }
  }
  return <div className="auth-social">
    <button type="button" className="google-button" onClick={() => void start()} disabled={pending}>
      <svg aria-hidden="true" viewBox="0 0 48 48" width="20" height="20">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.9 46.98 24.55z"/>
        <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.77-4.59l-7.97-6.2A23.95 23.95 0 0 0 0 24c0 3.87.93 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.9-2.13 15.87-5.8l-7.73-6C29.99 37.65 27.27 38.5 24 38.5c-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <span>{pending ? "Conectando…" : "Continuar con Google"}</span>
    </button>
    {error && <p role="alert" className="auth-feedback error">{error}</p>}
  </div>;
}
