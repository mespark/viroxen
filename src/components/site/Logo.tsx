export function Logo({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.2 262)" />
          <stop offset="100%" stopColor="oklch(0.78 0.14 220)" />
        </linearGradient>
      </defs>
      <path
        d="M4 8 L14 8 L20 22 L26 8 L36 8 L22 34 L18 34 Z"
        fill="url(#vx-g)"
      />
      <path
        d="M10 6 L14 6 L20 18 L26 6 L30 6 L22 24 L18 24 Z"
        fill="url(#vx-g)"
        opacity="0.55"
      />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Logo />
      <span className="text-lg font-semibold tracking-[0.18em] text-foreground">VIROXEN</span>
    </div>
  );
}