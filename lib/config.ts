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
    posterTime: "5:30 PM onwards",
    posterPlace: "Omaxe, Rohtak",
    // The coral pill under the details, as on the poster.
    dressLine: "Dress like you are the main character",
    posterNote: "Invite-only",
    // Countdown target — ISO time with the IST offset.
    startsAt: "2026-10-31T17:30:00+05:30",
  },

  description:
    "Disconnect's Diwali House Party — a night of festive fits, filmy vibes " +
    "and unforgettable memories. Saturday, 31 October 2026, 5:30 PM onwards " +
    "at Omaxe, Rohtak. Invite-only, spots are limited.",

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
    { label: "Time", value: "5:30 PM onwards" },
    { label: "Location", value: "Omaxe, Rohtak, Haryana" },
    { label: "Venue address", value: "Shared upon confirmation" },
  ],

  dressCode: {
    title: "Strictly ethnic",
    body:
      "Bring out your kurtas, suits, sarees, lehengas, shararas and your most " +
      "iconic festive fits. Come dressed to be the main character!",
  },

  // Registration section (id="register") — the form posts to a Google Form.
  register: {
    heading: "Request an invite",
    subline: "Private guest list · Registration takes about 1 minute",
    note:
      "Filling out this form is a registration request and does not automatically " +
      "confirm your entry. You'll receive confirmation and further details from Disconnect.",
    thanksTitle: "You're on the request list!",
    thanksBody: "We'll confirm on WhatsApp/Instagram soon.",
    soonMessage: "Registrations open soon! Meanwhile, DM us on Instagram to get on the list.",
  },

  /**
   * GOOGLE FORM WIRING
   * 1. Open your Google Form → Send → link → copy the viewform URL.
   * 2. Run:  node scripts/google-form-entries.mjs "<viewform URL>"
   *    It prints the formResponse URL and every question's entry ID.
   * 3. Paste them below. While formAction is "", the form shows a friendly
   *    "registrations open soon" message and makes no network call
   *    (or opens links.register instead, if that is set).
   * The Google Form questions should be: short answer for name, mobile,
   * email, instagram, why; multiple choice for ageGroup, heardFrom (with the
   * "Other" option switched on) and comfortable — with the exact option texts
   * from the lists below.
   */
  googleForm: {
    formAction: "", // CONFIRM: https://docs.google.com/forms/d/e/<FORM_ID>/formResponse
    entries: {
      name: "entry.1000000001", // CONFIRM
      ageGroup: "entry.1000000002", // CONFIRM
      mobile: "entry.1000000003", // CONFIRM (sent as +91XXXXXXXXXX)
      email: "entry.1000000004", // CONFIRM (or leave "" if you use Google's own "collect emails")
      instagram: "entry.1000000005", // CONFIRM (sent as @handle)
      heardFrom: "entry.1000000006", // CONFIRM
      // Leave "" if "Other" is the built-in Other option of the heardFrom
      // question (the text is then sent as <heardFrom>.other_option_response).
      // Set it only if you made a separate short-answer question for it.
      heardFromOther: "", // CONFIRM
      why: "entry.1000000007", // CONFIRM
      comfortable: "entry.1000000008", // CONFIRM
    },
  },

  form: {
    ageGroups: ["18–20", "21–24", "25–29", "30+"],
    heardFrom: ["Instagram", "Existing member", "Friend's referral", "Other"],
    comfortable: ["Yes", "I'd love to meet new people", "I'm a little shy but open to it"],
  },

  ctas: {
    primary: "Request an invite",
    instagram: "DM on Instagram",
    whatsapp: "Join the WhatsApp community",
  },

  links: {
    // Optional fallback: if googleForm.formAction is still "" but this is set,
    // submitting the on-page form opens this link (e.g. the Google Form itself).
    register: "", // CONFIRM (optional)
    instagram: "https://www.instagram.com/disconnectfr",
    instagramDM: "https://ig.me/m/disconnectfr", // CONFIRM: opens a DM with @disconnectfr
    whatsapp: "https://chat.whatsapp.com/CidRJyLYXGa1jFY7TY8m7U",
  },
};

/** Every "Request an invite" button scrolls to the on-page form. */
export const registerHref = "#register";

export type Site = typeof site;
