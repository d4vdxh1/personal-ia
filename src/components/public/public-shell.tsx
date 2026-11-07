import Link from "next/link";
import type { ReactNode } from "react";

export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="public-site">
      <a href="#public-main" className="public-skip">Saltar al contenido</a>
      <header className="public-topbar">
        <Link href="/welcome" className="public-logo" aria-label="Día a Día, página principal">
          <span className="public-mark" aria-hidden="true">✳</span>
          <span>Día a Día<small>Un paso más</small></span>
        </Link>
        <nav aria-label="Navegación pública" className="public-topnav">
          <Link href="/privacy">Privacidad</Link>
          <Link href="/terms">Condiciones</Link>
          <Link href="/login" className="public-small-cta">Iniciar sesión</Link>
        </nav>
      </header>
      <main id="public-main">{children}</main>
      <footer className="public-footer">
        <p><strong>Día a Día</strong> · Tu espacio personal, un paso más.</p>
        <nav aria-label="Enlaces legales">
          <Link href="/welcome">Inicio</Link>
          <Link href="/privacy">Política de privacidad</Link>
          <Link href="/terms">Condiciones del servicio</Link>
          <a href="https://github.com/d4vdxh1/personal-ia" target="_blank" rel="noopener noreferrer">Código del proyecto</a>
        </nav>
      </footer>
    </div>
  );
}
