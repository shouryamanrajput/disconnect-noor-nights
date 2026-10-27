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

  deets: [
    { label: "Date", value: "Saturday, 31 October 2026" },
    { label: "Time", value: "5:30 PM onwards" },
    { label: "Location", value: "Omaxe, Rohtak, Haryana" },
    { label: "Venue address", value: "Shared upon confirmation" },
  ],

  // "The scene" section (after the deets). Photos live in /public/scene.
  // Card 1 is the tall feature card; the last card runs full width (phones,
  // tablets and desktop). Desktop: card 1 spans two rows beside a 2×2.
  scene: {
    heading: "The scene",
    intro: "This Diwali, we’re doing things a little differently.",
    subline: "A night of festive fits, filmy vibes and unforgettable memories.",
    cards: [
      { title: "Dreamy Diwali decor", body: "A beautiful home dressed up in flowers, fairy lights and all things festive.", image: "/scene/decor.jpg", alt: "A hallway lined with marigold garlands and fairy lights" },
      { title: "Live DJ & dance floor", body: "Bollywood bangers on the decks and a dance floor that never empties.", image: "/scene/dj.jpg", alt: "Two women in festive outfits playing music on DJ decks" },
      { title: "Good food", body: "A festive spread and munchies to keep you going all night.", image: "/scene/food.jpg", alt: "A table laid out with snacks and drinks under marigold garlands" },
      { title: "Cards, Tambola & games", body: "Games and lots of friendly chaos.", image: "/scene/games.jpg", alt: "Playing cards scattered around a brass thali of flowers and diyas" },
      { title: "Glitter bar", body: "Glitter, face painting and pop-up fun to finish your look.", image: "/scene/glitter.jpg", alt: "A Glitter Bar sign beside jars of coloured glitter" },
      { title: "Good people", body: "Your favourite people, new faces and an evening you won’t want to end.", image: "/scene/people.jpg", alt: "Friends dancing together in festive outfits" },
    ],
    // Helios sticker (gifting partner; Helios is a shoe care brand,
    // heliosindia.com). Logo is their own, recoloured white.
    gift: {
      ring: "Exciting gift hampers by Helios",
      label: "Gift hampers by",
      logo: "/scene/helios-logo-white.png",
      url: "https://heliosindia.com",
    },
    closing: "Sounds like your scene?",
  },

  // Running strips (moving left). The first sits under the hero, the crossed
  // pair between the scene and the form.
  marquee: {
    top: ["Diwali House Party", "31 Oct 2026", "Omaxe, Rohtak", "Strictly ethnic", "Invite-only", "Spots are limited"],
    a: ["Live DJ", "Bollywood bangers", "Glitter bar", "Cards & Tambola", "Good food", "Good people"],
    b: ["Come dressed to be the main character", "See you on the dance floor", "Gift hampers by Helios"],
  },

  // The deets section's backdrop photo (Wikimedia Commons, credited below).
  deetsImage: "/scene/deets-diya.jpg",

  // Stock photos used on the page. CC BY needs a credit, shown in the footer.
  photoCredits: [
    { what: "Diya", by: "Subharnab Majumdar", license: "CC BY 2.0", url: "https://commons.wikimedia.org/wiki/File:Diya_Diwali_India.jpg" },
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
  sheetEndpoint: "https://script.google.com/macros/s/AKfycby8sBcdF6fzLK5lAuXdA3eg4nQVZ0pmGbukUfr62rAiNIpeJpDmQvQvS9A_GSvqeu_t/exec", // Google Apps Script web app (see SHEET-SETUP.md). Must be deployed with access "Anyone".

  /**
   * PAYMENT (step 2 of the form). After the details are sent, the visitor
   * sees this QR / UPI ID, pays, and uploads a screenshot. The screenshot is
   * saved to your Google Drive ("Disconnect Diwali Payments") by the Apps
   * Script and linked in the sheet row.
   */
  payment: {
    amount: "₹1,299", // shown to guests
    amountValue: "1299.00", // same amount for the UPI app link (am=)
    // UPI QR (cropped from the payee's QR; it already carries ₹1,299). If the
    // file is missing, a "QR coming soon" placeholder is shown instead.
    qrImage: "/payment-qr.png",
    upiId: "8168133686@axisbank", // copy button + "Pay with UPI app" on phones
    payeeName: "ISHITA", // shown as "Paying to ISHITA" and sent as pn= in the UPI link
    title: "Pay to confirm",
    body: "Use any UPI app (GPay, PhonePe, Paytm, BHIM…). The QR already has the amount filled in.",
  },

  /**
   * In-progress registration (step 2 "Pay to confirm") is kept in this tab's
   * sessionStorage only: regId, name, mobile, email (never the screenshot).
   * It expires ttlMinutes after registering, or after idleMinutes without
   * activity, and the visitor is asked to fill the form again.
   */
  session: { ttlMinutes: 30, idleMinutes: 15 },

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
