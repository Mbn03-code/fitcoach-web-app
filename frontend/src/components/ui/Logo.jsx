export default function Logo({ compact = false }) {
  return (
    <div className={`logo ${compact ? 'logo--compact' : ''}`}>
      <span className="logo-mark" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i>
      </span>
      <span>Futurea</span>
    </div>
  );
}
