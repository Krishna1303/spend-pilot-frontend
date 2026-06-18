export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="sp-field">
      {label && (
        <label htmlFor={id} className="sp-label">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`sp-input${error ? ' sp-input--error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="sp-field-error">{error}</span>}
    </div>
  );
}
