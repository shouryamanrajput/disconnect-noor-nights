/**
 * SITE CONFIG  ──  This is the one file you can safely edit yourself.
 *
 * Every word on the page, the event details, the countdown target and the
 * links the buttons open live here. Change anything and the site updates.
 *
 * Copy is taken from the Diwali House Party invite email. Links (Instagram,
 * WhatsApp community) are reused from the main Disconnect site.
 * Anything marked // CONFIRM is worth a quick double-check.
 */

export const site = {
  name: "Disconnect",
  fullName: "Disconnect — Fun Offline Experiences",
  handle: "@disconnectfr",
  city: "Rohtak",
  // Public URL once deployed (used for social share previews).
  siteUrl: "", // CONFIRM: e.g. https://diwali.disconnectfr.com

  event: {
    title: "Disconnect's Diwali House Party",
    hindiTitle: "दिवाली",
    latinTitle: "House Party",
    // Shown on the hero arch (poster style).
    posterDate: "Oct 31st, 2026",
    posterTime: "5:30 PM onwards", // CONFIRM: the poster says 6:00 PM, the invite email says 5:30 PM
    posterPlace: "Rohtak",
    posterNote: "Entry on invite only. DM to get on the list.",
    // Countdown target — ISO time with the IST offset.
    startsAt: "2026-10-31T17:30:00+05:30", // CONFIRM: change to 18:00 if the start is 6:00 PM
  },

  description:
    "Disconnect's Diwali House Party — a night of festive fits, filmy vibes " +
    "and unforgettable memories. Saturday, 31 October 2026, in a home in " +
    "Rohtak, Haryana. Invite-only, spots are limited.",

  // "What's the scene?" — short chips. `icon` picks a drawn icon in
  // components/SceneIcon.tsx (diya, dj, flower, paint, camera, cards, food, dance).
  scene: [
    { icon: "diya", label: "Diwali lights & florals" },
    { icon: "dj", label: "Live DJ & dance floor" },
    { icon: "flower", label: "DIY diyas" },
    { icon: "paint", label: "Face painting & pop-ups" },
    { icon: "camera", label: "Photobooths" },
    { icon: "cards", label: "Cards & Tambola" },
    { icon: "food", label: "Golgappa station & food" },
    { icon: "dance", label: "Great people" },
  ],

  deets: [
    { label: "Date", value: "Saturday, 31 October 2026" },
    { label: "Time", value: "5:30 PM onwards" }, // CONFIRM: poster says 6:00 PM
    { label: "Location", value: "A home in Rohtak, Haryana" },
    { label: "Venue address", value: "Shared upon confirmation" },
  ],

  dressCode: {
    title: "Strictly ethnic",
    body:
      "Bring out your kurtas, suits, sarees, lehengas, shararas and your most " +
      "iconic festive fits. Come dressed to be the main character!",
  },

  // Final call to action at the bottom of the page.
  invite: {
    heading: "See you on the dance floor!",
    note:
      "Invite-only, spots are limited. A request doesn’t confirm entry — " +
      "you’ll hear back from Disconnect with confirmation and details.",
  },

  ctas: {
    primary: "Request an invite",
    instagram: "DM on Instagram",
    whatsapp: "Join the WhatsApp community",
  },

  links: {
    // Registration form for this party. Leave "" until it's ready — the
    // "Request an invite" buttons then fall back to an Instagram DM.
    register: "", // CONFIRM: paste the Diwali registration form link here
    instagram: "https://www.instagram.com/disconnectfr",
    instagramDM: "https://ig.me/m/disconnectfr", // CONFIRM: opens a DM with @disconnectfr
    whatsapp: "https://chat.whatsapp.com/CidRJyLYXGa1jFY7TY8m7U",
  },
};

/** Where every "Request an invite" button points. */
export const registerHref = site.links.register || site.links.instagramDM;

export type Site = typeof site;
