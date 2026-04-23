type MivvoLogoProps = {
  size?: number;
  showText?: boolean;
  className?: string;
  textClassName?: string;
};

export function MivvoLogo({
  size = 32,
  showText = true,
  className = "",
  textClassName = "",
}: MivvoLogoProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Mivvo Logo"
      >
        <defs>
          <linearGradient id="mivvoGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B5CF6" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect x="6" y="6" width="52" height="52" rx="16" fill="url(#mivvoGrad)" />
        <path
          d="M18 22L24 42L32 28L40 42L46 22"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="32" r="29" stroke="white" strokeOpacity="0.18" strokeWidth="2" />
      </svg>
      {showText && <span className={`font-extrabold text-gray-900 ${textClassName}`}>Mivvo</span>}
    </div>
  );
}
