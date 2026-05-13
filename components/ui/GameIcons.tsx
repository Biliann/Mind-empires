type IconProps = {
  className?: string;
};

export function SudokuIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect x="7" y="7" width="34" height="34" rx="7" fill="currentColor" opacity="0.08" />
      <path d="M13 7v34M24 7v34M35 7v34M7 13h34M7 24h34M7 35h34" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 7h34v34H7zM7 18h34M7 30h34M18 7v34M30 7v34" fill="none" stroke="currentColor" strokeWidth="2.6" />
      <text x="14" y="18" fill="currentColor" fontSize="8" fontWeight="700">5</text>
      <text x="25" y="29" fill="currentColor" fontSize="8" fontWeight="700">9</text>
      <text x="36" y="39" fill="currentColor" fontSize="8" fontWeight="700">2</text>
    </svg>
  );
}

export function SakuraIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <g fill="currentColor">
        <path d="M24 22c-7-8-2-16 0-16s7 8 0 16Z" opacity="0.95" />
        <path d="M26 24c8-7 16-2 16 0s-8 7-16 0Z" opacity="0.85" />
        <path d="M24 26c7 8 2 16 0 16s-7-8 0-16Z" opacity="0.8" />
        <path d="M22 24c-8 7-16 2-16 0s8-7 16 0Z" opacity="0.9" />
        <path d="M25 23c1-10 11-11 12-9s-3 11-12 9Z" opacity="0.7" />
      </g>
      <circle cx="24" cy="24" r="3" fill="#7c2d12" opacity="0.45" />
    </svg>
  );
}

export function ToriiIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M8 11h32M12 16h24M17 16v25M31 16v25M13 41h8M27 41h8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="4" />
      <path d="M16 23h16" stroke="currentColor" strokeLinecap="round" strokeWidth="3" opacity="0.45" />
    </svg>
  );
}

export function ScrollIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M15 9h21v25a8 8 0 0 1-8 8H13a6 6 0 0 0 6-6V14a5 5 0 0 0-5-5h1Z" fill="currentColor" opacity="0.1" />
      <path d="M14 9h22v25a8 8 0 0 1-8 8H13M14 9a5 5 0 0 1 5 5v22a6 6 0 0 1-6 6 6 6 0 0 1 0-12h6M24 18h7M24 26h7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
    </svg>
  );
}
