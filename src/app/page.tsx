export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16 text-slate-900">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-teal-700">Tu espacio personal</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Asistente Personal IA
        </h1>
        <p className="mt-4 leading-7 text-slate-600">
          Un lugar para organizar tu rutina, registrar tus hábitos y acompañar
          tus objetivos.
        </p>
        <p className="mt-8 text-sm text-slate-500">
          Estamos preparando tu espacio.
        </p>
      </section>
    </main>
  );
}
