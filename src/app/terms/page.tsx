import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Condiciones del servicio | Día a Día",
  description: "Condiciones de uso de la aplicación personal Día a Día.",
};

export default function TermsPage() {
  return (
    <PublicShell>
      <article className="public-legal">
        <p className="public-eyebrow">CONDICIONES DE USO</p>
        <h1>Condiciones del servicio</h1>
        <p className="public-updated">Actualizado el 7 de noviembre de 2026 · Día a Día</p>
        <p>Día a Día es una aplicación de organización personal en desarrollo. Al registrarte y utilizar sus funciones, aceptás usarla de forma lícita y responsable. Las funciones y su disponibilidad pueden cambiar durante su evolución.</p>

        <h2>1. Tu cuenta</h2>
        <p>Para guardar registros necesitás una cuenta propia. Sos responsable de proteger tus credenciales y de no compartir sesiones con otras personas. No utilices identidades ajenas ni intentes consultar o modificar información de otras cuentas.</p>

        <h2>2. Los registros y el uso permitido</h2>
        <p>Conservás la responsabilidad sobre la información que ingresás. No uses el servicio para actividades ilícitas, para vulnerar sistemas o para publicar contenido que afecte derechos de terceros. El uso abusivo o automatizado que perjudique la disponibilidad del servicio puede ser limitado.</p>

        <h2>3. Entrenamiento y recomendaciones</h2>
        <p>Los apartados de actividad y entrenamiento sirven para organizar registros personales. No sustituyen la evaluación de profesionales de salud ni ofrecen diagnóstico o tratamiento médico. Las respuestas generadas por IA pueden contener errores y deben verificarse antes de tomar decisiones importantes.</p>

        <h2>4. Asistente IA y proveedores externos</h2>
        <p>El asistente Gemini se utiliza de forma opcional y con consentimiento para enviar las preguntas y datos de consulta necesarios. Cuando pedís marcar un hábito o registrar el check-in de hoy, podés revisar, confirmar o cancelar la propuesta. Actualizar un check-in existente exige aceptar el cambio en la tarjeta. El acceso a proveedores externos está sujeto a sus condiciones y puede verse limitado por cuota, interrupciones o cambios del proveedor.</p>

        <h2>5. Disponibilidad y cambios</h2>
        <p>El proyecto se encuentra en desarrollo y puede experimentar fallos o cambios de funcionalidad. Se procura mantener una experiencia segura, pero no se garantiza disponibilidad ininterrumpida ni ausencia de errores. La información importante debe conservarse también por medios propios cuando corresponda.</p>

        <h2>6. Privacidad y contacto</h2>
        <p>Consultá la <a href="/privacy">política de privacidad</a> para entender el uso de tus datos. Para consultas sobre tu cuenta, utilizá el correo de asistencia indicado en la pantalla de consentimiento de Google OAuth. Nunca publiques contraseñas ni información privada en incidencias públicas.</p>
      </article>
    </PublicShell>
  );
}
