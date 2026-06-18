export default function Card({ children, className = '', style, ...props }) {
  return (
    <div className={`sp-card ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}
