export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters',     test: (p) => p.length >= 8 },
  { key: 'upper',  label: 'One capital letter (A–Z)',   test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number (0–9)',           test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol (e.g. @, #, !)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

export default function PasswordChecklist({ password }) {
  if (!password) return null
  return (
    <ul className="mt-2 flex flex-col gap-1.5 px-3.5 py-3 bg-page border border-line rounded-xl">
      {PASSWORD_RULES.map(({ key, label, test }) => {
        const met = test(password)
        return (
          <li
            key={key}
            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${
              met ? 'text-success' : 'text-slate-400'
            }`}
          >
            <span className="w-3.5 text-center font-bold shrink-0">{met ? '✓' : '○'}</span>
            {label}
          </li>
        )
      })}
    </ul>
  )
}
