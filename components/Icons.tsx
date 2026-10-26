// Small gold line icons used in the hero and buttons.
type I = { className?: string };
const base = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function EnvelopeIcon({ className = "h-4 w-4" }: I) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" fill="currentColor" />
      <path d="M3.5 6.5 12 13l8.5-6.5" fill="none" stroke="#FFD43B" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
export function CalendarIcon({ className = "h-5 w-5" }: I) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...base}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M8 3v4M16 3v4M3.5 10h17M8 14h1M11.5 14h1M15 14h1M8 17h1M11.5 17h1" />
    </svg>
  );
}
export function ClockIcon({ className = "h-5 w-5" }: I) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
export function PinIcon({ className = "h-5 w-5" }: I) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.6A2.6 2.6 0 1 1 12 6.4a2.6 2.6 0 0 1 0 5.2Z" fill="currentColor" />
    </svg>
  );
}
