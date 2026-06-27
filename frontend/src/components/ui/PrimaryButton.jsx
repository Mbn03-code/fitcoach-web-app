export default function PrimaryButton({ children, loading = false, type = 'button' }) {
  return (
    <button className="primary-button" type={type} disabled={loading}>
      <span>{loading ? 'Please wait...' : children}</span>
    </button>
  );
}
