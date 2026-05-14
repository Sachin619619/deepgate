import { CSSProperties } from 'react';

export function LogoMark({ size = 22, className = '', style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path d="M6 6 L16 16 L6 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 6 L26 16 L16 26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
    </svg>
  );
}

export function Wordmark({ size = 22, className = '' }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-semibold tracking-tight ${className}`}>
      <span className="text-[color:var(--accent)]"><LogoMark size={size} /></span>
      <span>DeepGate</span>
    </span>
  );
}
