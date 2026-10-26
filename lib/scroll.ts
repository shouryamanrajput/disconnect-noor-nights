// Smooth-scroll to the registration form. Uses Lenis on desktop (exposed by
// SmoothScroll as window.__lenis) and native smooth scroll elsewhere.
type LenisLike = { scrollTo: (target: Element, opts?: { offset?: number; duration?: number }) => void };

export function scrollToRegister() {
  const el = document.getElementById("register");
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis && !reduced) lenis.scrollTo(el, { offset: -64, duration: 1.4 });
  else el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  history.replaceState(null, "", "#register");
  // Move focus to the first field once the scroll has settled (no jump).
  window.setTimeout(() => {
    document.getElementById("rf-name")?.focus({ preventScroll: true });
  }, reduced ? 50 : 1200);
}
