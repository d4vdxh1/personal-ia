import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";

export const metadata: Metadata = {
  title: "Política de privacidad | Día a Día",
  description: "Cómo Día a Día utiliza datos de cuenta, hábitos, estudio, entrenamiento y consultas al asistente Gemini.",
};

export default function PrivacyPage() {
  return (
    <PublicShell>
      <article className="public-legal">
        <p className="public-eyebrow">INFORMACIÓN Y TRANSPARENCIA</p>
        <h1>Política de privacidad</h1>
        <p className="public-updated">Actualizado el 7 de noviembre de 2026 · Aplicación Día a Día</p>
        <p>Día a Día es una aplicación personal de organización. Esta política explica qué información se utiliza para ofrecer las funciones, qué servicios externos intervienen y las opciones disponibles para gestionar los datos. Se aplica a esta aplicación, no a otras páginas del desarrollador.</p>

        <h2>1. Información que se procesa</h2>
        <p>Al crear una cuenta con correo, Supabase Auth procesa la dirección de correo, las credenciales de autenticación protegidas y la información de sesión. Al iniciar sesión con Google, se reciben los datos de identidad autorizados para el acceso, como identificador, nombre y correo, según el consentimiento otorgado; Día a Día no recibe tu contraseña de Google.</p>
        <p>La información que registrás en la aplicación puede incluir hábitos, check-ins, entradas de diario, objetivos, rutinas, sesiones y medidas de entrenamiento, molestias registradas voluntariamente, materias, tareas, exámenes y sesiones de estudio. Algunos registros son personales o sensibles: compartilos únicamente si querés utilizar las funciones correspondientes.</p>

        <h2>2. Para qué se utiliza</h2>
        <p>Usamos los datos para autenticar tu cuenta, guardar los registros que decidís crear, presentar tu progreso y ofrecer consultas sobre tu información. No solicitamos permisos para acceder a Google Drive, Gmail o Google Calendar mediante el inicio de sesión actual. Google se utiliza para identificarte cuando elegís ese método.</p>

        <h2>3. Dónde se procesan los datos</h2>
        <p>La aplicación está desplegada en Vercel. Supabase proporciona la autenticación y la base PostgreSQL donde se almacenan los registros. Google interviene cuando elegís iniciar sesión con Google o utilizar Gemini. Cada proveedor puede procesar información conforme a sus propios términos y políticas, incluidos posibles tratamientos en otros países.</p>
        <p>Los registros privados están asociados a tu identificador de usuario, y las tablas utilizan políticas de acceso por usuario (Row Level Security). Esto no supone una garantía absoluta contra incidentes de seguridad.</p>

        <h2>4. Uso del asistente Gemini</h2>
        <p>El chat solicita consentimiento antes de enviar preguntas a Gemini. Cuando una pregunta requiere datos de tu cuenta, se transmiten únicamente los campos seleccionados por las herramientas de consulta autorizadas, como tareas pendientes, hábitos, objetivos y entrenamiento. Las herramientas actuales del asistente no envían el contenido del diario ni los registros de molestias. El asistente no puede crear ni cambiar registros en esta versión.</p>
        <p>El historial visible del chat se conserva en memoria mientras usás la pantalla y no se guarda como conversación en la base de datos de Día a Día. Sí se guardan contadores por cuenta y fecha para limitar el uso. Google puede procesar las solicitudes conforme a las condiciones del servicio Gemini utilizado; evitá incluir datos íntimos en tus preguntas.</p>

        <h2>5. Cookies, seguridad y conservación</h2>
        <p>Se utilizan cookies técnicas para mantener la autenticación y actualizar la sesión. Los registros permanecen asociados a la cuenta mientras no se eliminen. Los servicios externos pueden aplicar sus propios períodos de conservación y respaldo. El proyecto todavía no ofrece un botón de eliminación integral de la cuenta dentro de la aplicación.</p>

        <h2>6. Tus opciones</h2>
        <p>Podés dejar de utilizar el asistente, cerrar sesión y modificar los registros que admitan edición. Para solicitar acceso, corrección o eliminación de tu información y cuenta, contactá al responsable del proyecto mediante el correo de asistencia que se muestra en la pantalla de consentimiento de Google OAuth. Para consultas generales, también podés consultar el <a href="https://github.com/d4vdxh1" target="_blank" rel="noopener noreferrer">perfil público del desarrollador</a>. No compartas información personal en incidencias públicas de GitHub.</p>

        <h2>7. Cambios a esta política</h2>
        <p>Si las funciones o los proveedores cambian, la política deberá actualizarse para describir el nuevo tratamiento de información. Esta versión refleja las funciones disponibles hasta la Fase 4A del proyecto.</p>
      </article>
    </PublicShell>
  );
}
