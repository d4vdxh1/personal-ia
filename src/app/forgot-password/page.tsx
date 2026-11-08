import Link from "next/link";
import { RecoveryForm } from "@/components/auth/recovery-form";
export default function ForgotPasswordPage(){
 return <main className="auth-shell"><section className="auth-card auth-card-v2">
   <Link href="/login" className="auth-back">← Iniciar sesión</Link>
   <p className="auth-eyebrow">RECUPERAR ACCESO</p>
   <h1>Recuperá tu contraseña.</h1>
   <p className="auth-description">Te enviaremos un enlace a tu correo si existe una cuenta asociada.</p>
   {process.env.EMAIL_RECOVERY_ENABLED === "true" ? <RecoveryForm/> :
     <p className="auth-description" role="status">La recuperación por correo estará disponible cuando configuremos el servicio de emails.</p>}
 </section></main>;
}
