// Centralized copy for the SynoRing site.
// All headline & marketing strings live here so non-engineers can edit
// without touching component code.

export const brand = {
  name: "SynoRing",
  mark: "SYNORING",
  tagline: "A New Instrument of Input",
  signature: "Designed in Illinois · Forged for AR",
};

export const nav = {
  links: [
    { label: "Object", href: "#why" },
    { label: "Craft", href: "#how" },
    { label: "Atelier", href: "#team" },
    { label: "Press", href: "#press" },
    { label: "Reserve", href: "#reserve" },
  ],
  langs: ["EN", "中"],
};

export const hero = {
  eyebrow: "A New Instrument of Input",
  headline: {
    line1: "The",
    italic: "silent",
    line1cont: "command,",
    line2: "cast in titanium.",
  },
  quote: [
    "The most natural human gesture",
    "becomes the next universal interface.",
  ],
  ctas: {
    primary: { label: "Reserve", href: "#reserve" },
    ghost: { label: "Engineering notes →", href: "#how" },
  },
  footerLeft: "Designed in Illinois · Forged for AR",
  footerRight: "Scroll to discover ↓",
};

export const whyRing = {
  eyebrow: "01 — The Problem of Input",
  headline: {
    line1: "Cameras drain.",
    line2: "Voices echo.",
    italic: "A ring is",
    italicTail: " quiet.",
  },
  intro:
    "AR glasses have inherited every problem of the input devices around them. The ring solves it by disappearing — into the body, into the gesture, into the moment.",
  competitors: [
    {
      method: "Optical recognition",
      vs: "Cameras",
      issue: "Heavy compute, weight, battery drain.",
    },
    {
      method: "Voice control",
      vs: "Microphones",
      issue: "Awkward in public. Falls apart in noise.",
    },
    {
      method: "Temple touch",
      vs: "Glasses arms",
      issue: "Visible. Limited gestures. Looks strange.",
    },
    {
      method: "Eye tracking",
      vs: "IR sensors",
      issue: "Unreliable on AR. Fatigue. No fine control.",
    },
    {
      method: "SynoRing",
      vs: "A ring",
      issue: "Invisible. Comfortable. Private. Always with you.",
      featured: true,
    },
  ],
};

export const howItWorks = {
  eyebrow: "02 — The Craft",
  headline: "Three components.\nOne invisible interface.",
  intro:
    "SynoRing combines high-resolution inertial sensing, full-circumference touch detection, and a phone-side compute SDK. Together they read intention before motion is complete.",
  components: [
    {
      number: "I",
      title: "IMU — Inertial Mind",
      body: "Onboard 9-axis IMU reads micro-gestures of the finger. The ring knows orientation before you do.",
    },
    {
      number: "II",
      title: "360° Touch Surface",
      body: "The entire circumference of the band is a capacitive touch zone. Pair once, and the ring calibrates to your wearing angle and posture automatically.",
    },
    {
      number: "III",
      title: "Phone-side SDK",
      body: "Heavy lifting happens on your phone — gesture classification, AI intent, content routing. The ring stays cool. The battery stays full.",
    },
  ],
};

export const useCases = {
  eyebrow: "03 — In Use",
  headline: "Two moments, one ring.",
  cases: [
    {
      number: "Desk",
      title: "At the desk.",
      body: "Read a PDF on your AR glasses while typing on your laptop. Scroll, highlight, jump pages — all from a finger on the desktop. No voice. No hand in the air.",
      detail: "PDF · Docs · Spotify · Google Maps",
    },
    {
      number: "Street",
      title: "On the street.",
      body: "Walking through a crowded station, AR glasses showing turn-by-turn. Public voice is awkward. Tapping glasses is stranger. A finger gesture is invisible.",
      detail: "Navigation · Messages · Calls · Music",
    },
  ],
};

export const specs = {
  eyebrow: "04 — The Instrument",
  headline: "Engineered to disappear.",
  list: [
    { label: "Material", value: "Aerospace-grade titanium" },
    { label: "Sensor", value: "9-axis IMU · 1000Hz" },
    { label: "Touch", value: "360° capacitive · 5 mm pitch" },
    { label: "Sizes", value: "US 6 — 13" },
    { label: "Connectivity", value: "Bluetooth LE · UWB" },
    { label: "Battery", value: "5 days typical · USB-C base" },
    { label: "Water", value: "5 ATM · IP68" },
    { label: "Compatibility", value: "AR glasses · iOS · Android" },
  ],
};

export const roadmap = {
  eyebrow: "05 — Where We're Going",
  headline: "From a ring,\nto a layer.",
  steps: [
    {
      year: "2024 — Now",
      title: "Prototype & Patents",
      body: "Mechanical design validated. First gestures recognized. Patent applications in progress.",
      state: "current",
    },
    {
      year: "2025",
      title: "AR Partner Integrations",
      body: "SDK live with select AR glasses manufacturers. First commercial bundles ship.",
      state: "next",
    },
    {
      year: "2026",
      title: "Volume Production",
      body: "Consumer ring with SDK licensing for AR partners worldwide.",
      state: "future",
    },
    {
      year: "Beyond",
      title: "Non-Invasive BCI",
      body: "Move sensing from the finger to the temple. The ring becomes a layer — invisible without being worn.",
      state: "horizon",
    },
  ],
};

export const team = {
  eyebrow: "06 — The Atelier",
  headline: "Four engineers.\nOne building in Illinois.",
  intro:
    "Founded by four PhD students at the University of Illinois Urbana-Champaign, working across computer science, industrial engineering, electrical engineering, and computer engineering.",
  members: [
    { name: "Xu Cao", role: "Computer Science · UIUC", focus: "Gesture AI" },
    {
      name: "Houze Yang",
      role: "Industrial Engineering · UIUC",
      focus: "Manufacturing",
    },
    { name: "Yi Zhong", role: "Electrical Engineering · UIUC", focus: "Sensors" },
    {
      name: "Fuyu Qiu",
      role: "Computer Engineering · UIUC",
      focus: "Embedded SDK",
    },
  ],
};

export const cta = {
  eyebrow: "Reserve",
  headline: "A small instrument\nfor a quiet age of intelligence.",
  body: "First production batch ships Q2 2027. Reserve now, fully refundable until shipment.",
  primary: { label: "Reserve", href: "#" },
  ghost: { label: "Talk to Atelier →", href: "mailto:hello@synoring.com" },
  fineprint: "Free worldwide shipping. 30-day returns. 2-year warranty.",
};

export const footer = {
  cols: [
    {
      title: "Object",
      links: [
        { label: "Specifications", href: "#specs" },
        { label: "Materials", href: "#specs" },
        { label: "Compatibility", href: "#specs" },
      ],
    },
    {
      title: "Craft",
      links: [
        { label: "How it works", href: "#how" },
        { label: "Engineering notes", href: "#" },
        { label: "Roadmap", href: "#roadmap" },
      ],
    },
    {
      title: "Atelier",
      links: [
        { label: "About the team", href: "#team" },
        { label: "Careers", href: "#" },
        { label: "Press kit", href: "#" },
      ],
    },
    {
      title: "Reserve",
      links: [
        { label: "Pre-order", href: "#reserve" },
        { label: "Developer SDK", href: "#" },
        { label: "Contact", href: "mailto:hello@synoring.com" },
      ],
    },
  ],
  legal: "© 2026 SynoRing. Designed in Illinois.",
  small: "SynoRing™ is a trademark of SynoRing Labs Inc.",
};
