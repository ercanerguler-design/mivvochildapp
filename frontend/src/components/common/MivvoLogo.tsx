type MivvoLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
  variant?: "parent" | "child";
};

const COLORS = {
  parent: { from: "#4F46E5", to: "#8B5CF6", accent: "#FF8A65" },
  child: { from: "#FF8A65", to: "#F05A7E", accent: "#4F46E5" },
};

/** Mivvo "Kucak" mark: a parent figure embracing a child. Source: brand/mivvo-mark.svg */
export function MivvoMark({ size = 32, variant = "parent" }: { size?: number; variant?: "parent" | "child" }) {
  const c = COLORS[variant];
  const id = `mivvo-g-${variant}`;
  return (
    <svg width={size} height={size} viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1024" y2="1024" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.from} />
          <stop offset="1" stopColor={c.to} />
        </linearGradient>
      </defs>
      <rect width="1024" height="1024" rx="232" fill={`url(#${id})`} />
      <path d="M268 470 Q268 790 512 790 Q756 790 756 470" fill="none" stroke="#fff" strokeWidth="104" strokeLinecap="round" />
      <circle cx="512" cy="520" r="112" fill={c.accent} />
      <circle cx="512" cy="268" r="84" fill="#fff" />
    </svg>
  );
}

export function MivvoLogo({
  size = 32,
  showText = true,
  className = "",
  textClassName = "",
  variant = "parent",
}: MivvoLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <MivvoMark size={size} variant={variant} />
      {showText ? (
        <span className={`font-display font-extrabold tracking-tight text-gray-900 ${textClassName}`}>mivvo</span>
      ) : (
        <span className="sr-only">Mivvo</span>
      )}
    </span>
  );
}
