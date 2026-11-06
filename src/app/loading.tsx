/**
 * Segment-level loading UI: displayed immediately on client navigation
 * while a dynamic Server Component waits for authentication and Supabase.
 */
export default function Loading() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="Cargando sección">
      <div className="loading-header">
        <div className="loading-bar loading-title" />
        <div className="loading-bar loading-subtitle" />
      </div>
      <div className="loading-grid">
        <div className="loading-card">
          <div className="loading-bar loading-card-title" />
          <div className="loading-bar loading-line" />
          <div className="loading-bar loading-line-short" />
          <div className="loading-bar loading-line" />
        </div>
        <div className="loading-card">
          <div className="loading-bar loading-card-title" />
          <div className="loading-bar loading-line-short" />
          <div className="loading-bar loading-line" />
        </div>
      </div>
      <span className="loading-message">Cargando tu información…</span>
    </div>
  );
}
