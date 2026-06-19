import { ArrowRight } from 'lucide-react';

export default function PrimaryButton({ children, loading = false, type = 'button' }) {
  return (
    <button className="primary-button" type={type} disabled={loading}>
      <span>{loading ? 'Please wait...' : children}</span>
      {!loading && <ArrowRight size={24} strokeWidth={2.6} />}
    </button>
  );
}
