// Small festive line icons for the "What's the scene?" cards.
const paths: Record<string, React.ReactNode> = {
  diya: (
    <>
      <path d="M24 6c4 5 4 10 0 14-4-4-4-9 0-14Z" fill="#FFD43B" stroke="none" />
      <path d="M6 24h36c-2 10-9 15-18 15S8 34 6 24Z" />
      <path d="M12 30h24" />
    </>
  ),
  dj: (
    <>
      <path d="M8 28v-4a16 16 0 0 1 32 0v4" />
      <rect x="6" y="27" width="8" height="12" rx="3" />
      <rect x="34" y="27" width="8" height="12" rx="3" />
    </>
  ),
  flower: (
    <>
      <circle cx="24" cy="22" r="4" fill="#FF8A1F" stroke="none" />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="24" cy="13" rx="4" ry="7" transform={`rotate(${a} 24 22)`} />
      ))}
      <path d="M24 32v10M24 38c-4-3-8-3-10-1M24 38c4-3 8-3 10-1" />
    </>
  ),
  paint: (
    <>
      <path d="M24 6C13 6 6 14 6 23c0 8 6 12 11 12 3 0 3 3 3 5 0 2 2 3 4 3 10 0 18-8 18-19S35 6 24 6Z" />
      <circle cx="15" cy="20" r="2.5" fill="#FF8A1F" stroke="none" />
      <circle cx="22" cy="13" r="2.5" fill="#FF5FB0" stroke="none" />
      <circle cx="31" cy="14" r="2.5" fill="#FFD43B" stroke="none" />
      <circle cx="35" cy="23" r="2.5" fill="#3DB356" stroke="none" />
    </>
  ),
  camera: (
    <>
      <rect x="6" y="14" width="36" height="24" rx="5" />
      <path d="M17 14l3-5h8l3 5" />
      <circle cx="24" cy="26" r="7" />
      <circle cx="36" cy="19" r="1.5" fill="#FFD43B" stroke="none" />
    </>
  ),
  cards: (
    <>
      <rect x="8" y="10" width="20" height="28" rx="3" transform="rotate(-12 18 24)" />
      <rect x="20" y="10" width="20" height="28" rx="3" transform="rotate(10 30 24)" />
      <path d="M30 20c2-3 6-1 4 2l-4 4-4-4c-2-3 2-5 4-2Z" fill="#FF5FB0" stroke="none" />
    </>
  ),
  food: (
    <>
      <path d="M6 26h36c0 8-8 14-18 14S6 34 6 26Z" />
      <circle cx="16" cy="20" r="5" />
      <circle cx="26" cy="17" r="5" />
      <circle cx="34" cy="21" r="4.5" />
    </>
  ),
  dance: (
    <>
      <path d="M18 34V10l20-4v24" />
      <circle cx="13" cy="34" r="5" />
      <circle cx="33" cy="30" r="5" />
      <path d="M18 16l20-4" />
    </>
  ),
};

export default function SceneIcon({ name, className = "h-9 w-9" }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="#FFD43B"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {paths[name] ?? paths.diya}
    </svg>
  );
}
