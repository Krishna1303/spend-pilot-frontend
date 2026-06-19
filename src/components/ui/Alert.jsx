const STYLES = {
  error:   'bg-red-50 text-red-800 border border-red-200',
  success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border border-amber-200',
  info:    'bg-blue-50 text-blue-800 border border-blue-200',
}

const ICONS = { error: '✕', success: '✓', warning: '⚠', info: 'ℹ' }

export default function Alert({ variant = 'error', message, children }) {
  const content = message ?? children
  if (!content) return null
  return (
    <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm ${STYLES[variant]}`} role="alert">
      <span className="shrink-0 font-bold mt-px text-xs">{ICONS[variant]}</span>
      <span>{content}</span>
    </div>
  )
}
