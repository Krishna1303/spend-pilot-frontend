export const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters',     test: (p) => p.length >= 8 },
  { key: 'upper',  label: 'One capital letter (A–Z)',   test: (p) => /[A-Z]/.test(p) },
  { key: 'number', label: 'One number (0–9)',           test: (p) => /[0-9]/.test(p) },
  { key: 'symbol', label: 'One symbol (e.g. @, #, !)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export default function PasswordChecklist({ password }) {
  if (!password) return null;
  return (
    <ul className="pw-checklist">
      {PASSWORD_RULES.map(({ key, label, test }) => {
        const met = test(password);
        return (
          <li key={key} className={`pw-rule ${met ? 'pw-rule--met' : 'pw-rule--unmet'}`}>
            <span className="pw-rule__icon">{met ? '✓' : '○'}</span>
            {label}
          </li>
        );
      })}
    </ul>
  );
}
