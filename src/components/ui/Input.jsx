export default function Input({ label, id, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={[
          'w-full px-3.5 py-2.5 rounded-xl border text-sm text-ink bg-surface outline-none transition-all placeholder:text-slate-400',
          error
            ? 'border-danger focus:ring-2 focus:ring-danger/20 focus:border-danger'
            : 'border-line focus:border-primary focus:ring-2 focus:ring-primary/10',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  )
}
