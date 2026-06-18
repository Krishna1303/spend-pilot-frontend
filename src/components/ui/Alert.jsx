const ICONS = {
  error:   '✕',
  success: '✓',
  warning: '⚠',
  info:    'ℹ',
};

export default function Alert({ variant = 'error', message, children }) {
  const content = message ?? children;
  if (!content) return null;

  return (
    <div className={`sp-alert sp-alert--${variant}`} role="alert">
      <span className="sp-alert__icon" aria-hidden="true">
        {ICONS[variant]}
      </span>
      <span>{content}</span>
    </div>
  );
}
