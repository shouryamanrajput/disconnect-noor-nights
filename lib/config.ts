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
    thanksBody: "Payment screenshot received. We'll verify it and confirm on WhatsApp/Instagram soon.",
    soonMessage: "Registrations open soon! Meanwhile, DM us on Instagram to get on the list.",
  },

  /**
   * GOOGLE SHEET WIRING (Apps Script web app, see SHEET-SETUP.md)
   * Paste the Web app's /exec URL below. While it is "", the form shows a
   * friendly "registrations open soon" message and makes no network call
   * (or opens links.register instead, if that is set).
   */
  sheetEndpoint: "https://script.google.com/macros/s/AKfycbwLuADnHeGznzV2vyh7xai6mX-1Z_p_CnhNw9hB7xsr7lI9v0z-Ut_ASmnHimymtwnW/exec", // Google Apps Script web app (see SHEET-SETUP.md). Must be deployed with access "Anyone".

  /**
   * PAYMENT (step 2 of the form). After the details are sent, the visitor
   * sees this QR / UPI ID, pays, and uploads a screenshot. The screenshot is
   * saved to your Google Drive ("Disconnect Diwali Payments") by the Apps
   * Script and linked in the sheet row.
   */
  payment: {
    amount: "₹1,199", // shown to guests
    amountValue: "1199.00", // same amount for the UPI app link (am=)
    // UPI QR (cropped from the payee's QR; it already carries ₹1,199). If the
    // file is missing, a "QR coming soon" placeholder is shown instead.
    qrImage: "/payment-qr.png",
    upiId: "8168133686@axisbank", // copy button + "Pay with UPI app" on phones
    payeeName: "ISHITA", // shown as "Paying to ISHITA" and sent as pn= in the UPI link
    title: "Pay to confirm",
    body: "Use any UPI app (GPay, PhonePe, Paytm, BHIM…). The QR already has the amount filled in.",
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
    // Optional fallback: if sheetEndpoint is still "" but this is set,
    // submitting the on-page form opens this link instead.
    register: "", // CONFIRM (optional)
    instagram: "https://www.instagram.com/disconnectfr",
    instagramDM: "https://ig.me/m/disconnectfr", // CONFIRM: opens a DM with @disconnectfr
    whatsapp: "https://chat.whatsapp.com/CidRJyLYXGa1jFY7TY8m7U",
  },
};

/** Every "Request an invite" button scrolls to the on-page form. */
export const registerHref = "#register";

export type Site = typeof site;
