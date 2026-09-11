import {
  Clock,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
} from "lucide-react"
import { useState } from "react"

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

  .mp-app {
    --paper: #F3F1EC;
    --paper-alt: #EAE6DC;
    --ink: #1B1A20;
    --ink-soft: #5B5960;
    --accent: #6E1E2B;
    --brass: #9C7A3C;
    font-family: 'IBM Plex Sans', sans-serif;
    background: var(--paper);
    color: var(--ink);
    min-height: 100%;
    position: relative;
  }
  .mp-app * { box-sizing: border-box; }
  .mp-serif { font-family: 'Instrument Serif', serif; }
  .mp-serif-i { font-family: 'Instrument Serif', serif; font-style: italic; }

  .mp-grain {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.05; z-index: 1;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  .motif-media { position: absolute; inset: 0; overflow: hidden; }
  .motif-glow {
    position: absolute; inset: 0;
    background: radial-gradient(60% 60% at 22% 18%, rgba(255,255,255,0.22), transparent 60%);
    mix-blend-mode: screen;
  }
  .motif-svg { position: absolute; bottom: -8%; right: -8%; width: 78%; height: 78%; opacity: 0.5; transition: transform 0.5s ease; }
  .motif-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.7) 100%); }
  .mp-tile:hover .motif-svg, .mp-card:hover .motif-svg { transform: scale(1.06); }

  .hero-mark {
    position: absolute; right: -4%; top: -18%; font-size: 420px; line-height: 1;
    color: rgba(255,255,255,0.07); z-index: 0; pointer-events: none; user-select: none;
  }

  .top-switcher-row { display: flex; justify-content: center; gap: 8px; padding: 20px 0 0; flex-wrap: wrap; }
  .top-switcher {
    display: inline-flex; background: var(--paper-alt); flex-wrap: wrap;
    border: 1px solid rgba(27,26,32,0.12); border-radius: 999px; padding: 4px;
  }
  .top-switcher button {
    font-family: 'IBM Plex Sans', sans-serif; font-size: 12.5px; font-weight: 500;
    padding: 7px 14px; border-radius: 999px; border: none; background: transparent;
    color: var(--ink-soft); cursor: pointer;
  }
  .top-switcher button.active { background: var(--ink); color: var(--paper); }

  .sub-switcher-row { display: flex; justify-content: center; padding: 14px 0 0; }
  .sub-switcher { display: inline-flex; gap: 6px; }
  .sub-switcher button {
    font-size: 12px; padding: 5px 12px; border-radius: 999px; cursor: pointer;
    border: 1px solid rgba(27,26,32,0.18); background: transparent; color: var(--ink-soft);
  }
  .sub-switcher button.active { background: var(--accent); color: white; border-color: var(--accent); }

  .mp-wrap { max-width: 1100px; margin: 0 auto; padding: 0 28px; }

  .mp-nav { display: flex; justify-content: space-between; align-items: center; padding: 30px 0 26px; }
  .mp-wordmark { font-size: 24px; letter-spacing: 0.02em; margin: 0; }
  .mp-nav-links { display: flex; gap: 26px; font-size: 13.5px; color: var(--ink-soft); }
  .mp-nav-links span { cursor: default; }
  .mp-nav-links span.current { color: var(--ink); font-weight: 500; }

  .breadcrumb { font-size: 12.5px; color: var(--ink-soft); padding: 2px 0 18px; }

  .mp-hero-media { position: relative; width: 100%; height: 460px; margin-top: 8px; border-radius: 2px; overflow: hidden; }
  .mp-hero-text { position: absolute; left: 0; right: 0; bottom: 0; padding: 44px 44px 40px; z-index: 2; }
  .mp-hero-text h1 { color: white; font-size: 48px; line-height: 1.1; font-weight: 400; max-width: 15ch; margin: 0 0 18px; }
  .mp-hero-text p { font-size: 15.5px; color: rgba(255,255,255,0.82); max-width: 46ch; line-height: 1.6; margin: 0 0 24px; }
  .mp-hero-actions { display: flex; gap: 12px; }
  .mp-hero-actions .mp-btn { background: var(--paper); color: var(--ink); border-color: var(--paper); }
  .mp-hero-actions .mp-btn.accent-outline { background: transparent; color: var(--paper); border-color: var(--paper); }
  .mp-btn {
    font-family: 'IBM Plex Sans', sans-serif; font-size: 13.5px; font-weight: 500;
    padding: 11px 18px; border-radius: 4px; cursor: pointer; border: 1px solid var(--ink);
    background: var(--ink); color: var(--paper);
  }
  .mp-btn.outline { background: transparent; color: var(--ink); border-color: var(--ink); }
  .mp-btn.accent-outline { background: transparent; color: var(--accent); border-color: var(--accent); }

  .mp-roster { padding: 30px 0; border-bottom: 1px solid rgba(27,26,32,0.1); }
  .mp-roster .label { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 16px; }
  .mp-roster-row { display: flex; gap: 0; overflow-x: auto; align-items: center; }
  .mp-roster-row span { font-size: 20px; white-space: nowrap; padding: 0 20px; border-right: 1px solid var(--brass); }
  .mp-roster-row span:last-child { border-right: none; }

  .mp-section { padding: 40px 0 10px; }
  .mp-section .label { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 6px; }
  .mp-section .intro { font-size: 19px; max-width: 42ch; margin: 0 0 22px; }

  .mp-tile { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 18px; cursor: pointer; border-radius: 2px; }
  .mp-tile .content { position: relative; z-index: 2; }
  .mp-tile .tile-title { color: white; font-size: 21px; margin: 0 0 4px; }
  .mp-tile .tile-sub { color: rgba(255,255,255,0.78); font-size: 12.5px; margin: 0; }

  .mp-cat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding-bottom: 6px; }
  .mp-cat-grid .mp-tile { height: 230px; }
  .mp-coll-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding-bottom: 46px; }
  .mp-coll-grid .mp-tile { height: 280px; }
  .mp-coll-grid .tile-title { font-size: 25px; }

  .mp-card { position: relative; overflow: hidden; display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; cursor: pointer; }
  .mp-card--feature { grid-column: span 2; grid-row: span 2; padding: 22px; }
  .mp-card .content { position: relative; z-index: 2; }
  .mp-card .house { font-size: 12px; color: rgba(255,255,255,0.7); margin: 0 0 3px; }
  .mp-card .pname { font-size: 17px; margin: 0 0 6px; color: white; }
  .mp-card--feature .pname { font-size: 25px; }
  .mp-card .price { font-size: 13.5px; color: #E7D7B8; margin: 0; }
  .mp-card .add-btn {
    position: absolute; top: 14px; right: 14px; z-index: 3; width: 30px; height: 30px;
    border-radius: 50%; background: rgba(255,255,255,0.18); display: flex;
    align-items: center; justify-content: center; color: white;
  }
  .mp-card .buy-out-pill {
    position: absolute; top: 14px; right: 14px; z-index: 3; display: flex; align-items: center;
    gap: 5px; font-size: 11.5px; font-weight: 500; padding: 6px 11px; border-radius: 999px;
    background: var(--paper); color: var(--ink);
  }

  .mp-close { display: grid; grid-template-columns: 1.2fr 1fr; gap: 48px; align-items: center; padding: 46px 0 64px; border-top: 1px solid rgba(27,26,32,0.1); }
  .mp-close .statement { font-size: 26px; line-height: 1.35; max-width: 18ch; margin: 0; }
  .mp-close .apply-block h3 { font-size: 20px; font-weight: 400; margin: 0 0 8px; }
  .mp-close .apply-block p { font-size: 14px; color: var(--ink-soft); line-height: 1.6; margin: 0 0 16px; max-width: 36ch; }

  /* catalog */
  .cat-header { padding: 36px 0 18px; }
  .cat-header h1 { font-size: 34px; font-weight: 400; margin: 0 0 6px; }
  .cat-header p { font-size: 14px; color: var(--ink-soft); margin: 0; }
  .filter-bar { display: flex; justify-content: space-between; align-items: center; padding: 18px 0 26px; border-bottom: 1px solid rgba(27,26,32,0.1); flex-wrap: wrap; gap: 14px; }
  .filter-pills { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-pill { font-size: 13px; padding: 7px 14px; border-radius: 999px; border: 1px solid rgba(27,26,32,0.18); background: transparent; color: var(--ink-soft); cursor: pointer; }
  .filter-pill.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .sort-select { font-size: 13px; color: var(--ink-soft); border: 1px solid rgba(27,26,32,0.18); border-radius: 4px; padding: 7px 12px; background: var(--paper); }
  .catalog-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 26px 0 46px; }
  .catalog-grid .mp-card { height: 250px; }
  .catalog-count { font-size: 13px; color: var(--ink-soft); padding-bottom: 8px; }

  /* about */
  .about-hero { padding: 40px 0 8px; }
  .about-hero h1 { font-size: 42px; font-weight: 400; max-width: 17ch; margin: 0 0 20px; }
  .about-copy { font-size: 15.5px; color: var(--ink-soft); line-height: 1.7; max-width: 62ch; margin: 0 0 16px; }
  .about-stats { display: flex; border-top: 1px solid rgba(27,26,32,0.1); border-bottom: 1px solid rgba(27,26,32,0.1); padding: 26px 0; margin: 20px 0 36px; }
  .about-stats .stat { flex: 1; padding-right: 20px; }
  .about-stats .stat .big { font-size: 34px; margin: 0 0 4px; }
  .about-stats .stat .cap { font-size: 12.5px; color: var(--ink-soft); margin: 0; }
  .about-steps-label { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 20px; }
  .about-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; padding-bottom: 46px; }
  .about-step .num { font-size: 36px; color: var(--brass); margin: 0 0 8px; }
  .about-step h4 { font-size: 16px; font-weight: 500; margin: 0 0 6px; }
  .about-step p { font-size: 13.5px; color: var(--ink-soft); line-height: 1.55; margin: 0; }

  /* entity page (vendor / category / collection share this) */
  .ep-header-media { position: relative; width: 100%; height: 260px; margin-top: 8px; overflow: hidden; border-radius: 2px; }
  .ep-header { padding: 26px 0 20px; border-bottom: 1px solid rgba(27,26,32,0.1); }
  .ep-eyebrow { font-size: 13px; color: var(--ink-soft); margin: 0 0 10px; }
  .ep-header h1 { font-size: 40px; font-weight: 400; margin: 0 0 12px; }
  .ep-header p.story { font-size: 15px; color: var(--ink-soft); max-width: 58ch; line-height: 1.6; margin: 0; }
  .ep-meta { display: flex; gap: 26px; padding: 20px 0; flex-wrap: wrap; }
  .ep-meta-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-soft); }
  .ep-shelf-label { font-size: 13px; color: var(--ink-soft); padding: 22px 0 16px; }
  .ep-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding-bottom: 40px; }
  .ep-grid .mp-card { height: 220px; }
  .ep-note { border-top: 1px solid rgba(27,26,32,0.1); padding: 24px 0 50px; font-size: 13.5px; color: var(--ink-soft); max-width: 50ch; }

  /* account */
  .acct-header { padding: 36px 0 6px; }
  .acct-header h1 { font-size: 34px; font-weight: 400; margin: 0 0 6px; }
  .acct-header .sub { font-size: 13.5px; color: var(--ink-soft); margin: 0 0 18px; }
  .acct-section { padding: 26px 0; border-top: 1px solid rgba(27,26,32,0.1); }
  .acct-section .label { font-size: 12.5px; color: var(--ink-soft); margin: 0 0 16px; }
  .order-card { border: 1px solid rgba(27,26,32,0.14); border-radius: 4px; padding: 18px 20px; margin-bottom: 14px; }
  .order-head { display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 12px; }
  .order-head .oid { font-weight: 500; }
  .order-head .odate { color: var(--ink-soft); }
  .consign-row { display: flex; justify-content: space-between; align-items: center; padding: 9px 0; border-top: 1px solid rgba(27,26,32,0.08); font-size: 13.5px; }
  .consign-row:first-child { border-top: none; }
  .status-chip { font-size: 11px; padding: 3px 10px; border-radius: 999px; }
  .status-chip.shipped { background: rgba(143,160,137,0.28); color: #445A3F; }
  .status-chip.processing { background: rgba(156,122,60,0.22); color: #7A5E2C; }
  .status-chip.delivered { background: rgba(46,58,68,0.14); color: #2E3A44; }
  .acct-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .acct-info-grid .k { font-size: 12px; color: var(--ink-soft); margin: 0 0 4px; }
  .acct-info-grid .v { font-size: 14.5px; margin: 0; }

  @media (max-width: 680px) {
    .mp-cat-grid { grid-template-columns: repeat(2, 1fr); }
    .mp-coll-grid { grid-template-columns: 1fr; }
    .mp-card--feature { grid-column: span 2; }
    .mp-close { grid-template-columns: 1fr; }
    .ep-grid { grid-template-columns: repeat(2, 1fr); }
    .catalog-grid { grid-template-columns: repeat(2, 1fr); }
    .about-steps { grid-template-columns: 1fr; }
    .about-stats { flex-direction: column; gap: 16px; }
    .acct-info-grid { grid-template-columns: 1fr; }
    .mp-hero-media { height: 380px; }
    .mp-hero-text h1 { font-size: 32px; }
    .mp-hero-text { padding: 26px 24px 28px; }
    .hero-mark { font-size: 220px; }
  }
`

const houses = [
  "North & Ansel",
  "Verre Studio",
  "Maren Larkin",
  "Coeur Atelier",
  "Halvorsen",
  "Ondine",
  "Reyes & Fitch",
  "Amaranth House",
]

const homeCategories = [
  { name: "Jewelry", kind: "ring", tone: "#2E3A44" },
  { name: "Fragrance", kind: "bottle", tone: "#5B3A56" },
  { name: "Leather Goods", kind: "bag", tone: "#3E3226" },
  { name: "Clothing", kind: "blazer", tone: "#2E2A33" },
]

const homeCollections = [
  {
    name: "New to Vitrine",
    sub: "Houses approved this month",
    kind: "spark",
    tone: "#2E3A44",
  },
  {
    name: "The Winter Edit",
    sub: "Chosen by hand for the season",
    kind: "branch",
    tone: "#5B3A56",
  },
  {
    name: "Gifts Under $250",
    sub: "Considered, not cheap",
    kind: "ribbon",
    tone: "#6E1E2B",
  },
]

const catalogProducts = [
  {
    house: "Maren Larkin",
    name: "Hand-Forged Signet",
    price: "$610",
    tone: "#2E3A44",
    kind: "ring",
    category: "Jewelry",
  },
  {
    house: "Coeur Atelier",
    name: "No. 4 Eau de Parfum",
    price: "$210",
    tone: "#5B3A56",
    kind: "bottle",
    category: "Fragrance",
  },
  {
    house: "Halvorsen",
    name: "Saddle Weekender",
    price: "$890",
    tone: "#3E3226",
    kind: "bag",
    category: "Leather Goods",
  },
  {
    house: "North & Ansel",
    name: "Unstructured Blazer",
    price: "$460",
    tone: "#2E2A33",
    kind: "blazer",
    category: "Clothing",
  },
  {
    house: "Ondine",
    name: "Barrier Serum",
    price: "$96",
    tone: "#6E1E2B",
    kind: "drop",
    category: "Skincare",
  },
  {
    house: "Verre Studio",
    name: "Blown Glass Carafe",
    price: "$140",
    tone: "#4A5A4E",
    kind: "vessel",
    category: "Home",
  },
  {
    house: "Maren Larkin",
    name: "Thin Chain, 18k",
    price: "$340",
    tone: "#5B3A56",
    kind: "chain",
    category: "Jewelry",
  },
  {
    house: "Reyes & Fitch",
    name: "Structured Tote",
    price: "$520",
    tone: "#3E3226",
    kind: "bag",
    category: "Leather Goods",
    source: "affiliate",
  },
  {
    house: "Amaranth House",
    name: "Silk Slip Dress",
    price: "$380",
    tone: "#2E2A33",
    kind: "dress",
    category: "Clothing",
    source: "affiliate",
  },
]

const catalogFilters = [
  "All",
  "Jewelry",
  "Fragrance",
  "Leather Goods",
  "Clothing",
  "Skincare",
  "Home",
]

const marenPieces = [
  {
    house: "Maren Larkin",
    name: "Hand-Forged Signet",
    price: "$610",
    tone: "#2E3A44",
    kind: "ring",
  },
  {
    house: "Maren Larkin",
    name: "Thin Chain, 18k",
    price: "$340",
    tone: "#5B3A56",
    kind: "chain",
  },
  {
    house: "Maren Larkin",
    name: "Baroque Pearl Studs",
    price: "$275",
    tone: "#3E3226",
    kind: "studs",
  },
  {
    house: "Maren Larkin",
    name: "Wide Cuff",
    price: "$520",
    tone: "#4A5A4E",
    kind: "cuff",
  },
]

const jewelryCategoryProducts = [
  {
    house: "Maren Larkin",
    name: "Hand-Forged Signet",
    price: "$610",
    tone: "#2E3A44",
    kind: "ring",
  },
  {
    house: "Maren Larkin",
    name: "Thin Chain, 18k",
    price: "$340",
    tone: "#5B3A56",
    kind: "chain",
  },
  {
    house: "Reyes & Fitch",
    name: "Drop Pearl Earrings",
    price: "$295",
    tone: "#3E3226",
    kind: "studs",
  },
  {
    house: "Amaranth House",
    name: "Open Cuff",
    price: "$410",
    tone: "#4A5A4E",
    kind: "cuff",
  },
]

const winterEditProducts = [
  {
    house: "Halvorsen",
    name: "Saddle Weekender",
    price: "$890",
    tone: "#3E3226",
    kind: "bag",
  },
  {
    house: "North & Ansel",
    name: "Unstructured Blazer",
    price: "$460",
    tone: "#2E2A33",
    kind: "blazer",
    source: "affiliate",
  },
  {
    house: "Coeur Atelier",
    name: "No. 4 Eau de Parfum",
    price: "$210",
    tone: "#5B3A56",
    kind: "bottle",
  },
  {
    house: "Verre Studio",
    name: "Blown Glass Carafe",
    price: "$140",
    tone: "#4A5A4E",
    kind: "vessel",
  },
]

function Motif({ kind }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.4,
    strokeLinecap: "round",
  }
  switch (kind) {
    case "ring":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <circle cx="95" cy="105" r="62" {...common} />
          <circle cx="150" cy="60" r="16" fill="currentColor" opacity="0.9" />
        </svg>
      )
    case "chain":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M20,70 Q100,150 180,70"
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeDasharray="1 15"
            strokeLinecap="round"
          />
        </svg>
      )
    case "studs":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <circle cx="80" cy="110" r="13" {...common} />
          <circle cx="130" cy="90" r="13" {...common} />
        </svg>
      )
    case "cuff":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path d="M40,120 A65,65 0 1 1 165,95" {...common} />
        </svg>
      )
    case "bottle":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <rect x="60" y="95" width="70" height="95" rx="8" {...common} />
          <rect x="82" y="65" width="26" height="32" {...common} />
          <rect x="76" y="45" width="38" height="20" rx="4" {...common} />
        </svg>
      )
    case "drop":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M100,35 C135,85 155,120 155,148 A55,55 0 1 1 45,148 C45,120 65,85 100,35 Z"
            {...common}
          />
        </svg>
      )
    case "vessel":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M78,75 C78,58 122,58 122,75 L122,105 C150,118 150,180 100,180 C50,180 50,118 78,105 Z"
            {...common}
          />
        </svg>
      )
    case "bag":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path d="M55,110 L145,110 L135,185 L65,185 Z" {...common} />
          <path d="M72,110 C72,75 128,75 128,110" {...common} />
        </svg>
      )
    case "blazer":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path d="M55,45 L100,150 L145,45" {...common} />
          <path d="M100,150 L100,195" {...common} />
          <circle cx="100" cy="160" r="3.5" fill="currentColor" />
          <circle cx="100" cy="178" r="3.5" fill="currentColor" />
        </svg>
      )
    case "dress":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M85,45 L115,45 L128,85 L150,185 L50,185 L72,85 Z"
            {...common}
          />
          <path d="M85,45 C85,60 115,60 115,45" {...common} />
        </svg>
      )
    case "spark":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M100,30 L112,92 L172,100 L112,108 L100,170 L88,108 L28,100 L88,92 Z"
            fill="currentColor"
            opacity="0.85"
          />
        </svg>
      )
    case "branch":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path d="M35,185 C55,130 90,105 165,50" {...common} />
          <ellipse
            cx="95"
            cy="118"
            rx="15"
            ry="7"
            transform="rotate(-32 95 118)"
            fill="currentColor"
            opacity="0.85"
          />
          <ellipse
            cx="122"
            cy="88"
            rx="15"
            ry="7"
            transform="rotate(-32 122 88)"
            fill="currentColor"
            opacity="0.85"
          />
          <ellipse
            cx="70"
            cy="150"
            rx="15"
            ry="7"
            transform="rotate(-32 70 150)"
            fill="currentColor"
            opacity="0.85"
          />
        </svg>
      )
    case "ribbon":
      return (
        <svg className="motif-svg" viewBox="0 0 200 200">
          <path
            d="M100,95 C68,60 40,85 55,112 C68,135 100,112 100,95 C100,112 132,135 145,112 C160,85 132,60 100,95 Z"
            {...common}
          />
          <circle cx="100" cy="95" r="7" fill="currentColor" />
          <path d="M94,102 L84,175" {...common} />
          <path d="M106,102 L116,175" {...common} />
        </svg>
      )
    default:
      return null
  }
}

function MotifMedia({ tone, kind }) {
  return (
    <div
      className="motif-media"
      style={{
        background: `linear-gradient(135deg, ${tone} 0%, #14131A 100%)`,
        color: "rgba(243,241,236,0.6)",
      }}
    >
      <div className="motif-glow" />
      {kind && <Motif kind={kind} />}
      <div className="motif-scrim" />
    </div>
  )
}

function MediaTile({ tone, kind, title, subtitle }) {
  return (
    <div className="mp-tile">
      <MotifMedia tone={tone} kind={kind} />
      <div className="content">
        <p className="tile-title mp-serif">{title}</p>
        {subtitle && <p className="tile-sub">{subtitle}</p>}
      </div>
    </div>
  )
}

function ProductCard({ p }) {
  const isAffiliate = p.source === "affiliate"
  return (
    <div className={`mp-card ${p.feature ? "mp-card--feature" : ""}`}>
      <MotifMedia tone={p.tone} kind={p.kind} />
      {isAffiliate ? (
        <div className="buy-out-pill">
          <ExternalLink size={12} /> Buy at {p.house}
        </div>
      ) : (
        <div className="add-btn">
          <Plus size={15} />
        </div>
      )}
      <div className="content">
        <p className="house">{p.house}</p>
        <p className="pname mp-serif">{p.name}</p>
        <p className="price">{p.price}</p>
      </div>
    </div>
  )
}

function SiteNav({ current }) {
  const links = ["Catalog", "Houses", "About", "Account"]
  return (
    <div className="mp-nav">
      <p className="mp-wordmark mp-serif">Vitrine</p>
      <div className="mp-nav-links">
        {links.map((l) => (
          <span key={l} className={l === current ? "current" : ""}>
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

function HomePage() {
  return (
    <div className="mp-wrap">
      <SiteNav />

      <div className="mp-hero-media">
        <MotifMedia tone="#1B1A20" kind={null} />
        <div className="hero-mark mp-serif">V</div>
        <div className="mp-hero-text">
          <h1 className="mp-serif">
            Anyone can buy here. Almost no one gets to sell.
          </h1>
          <p>
            Every house on Vitrine was reviewed before a single product went
            live. One basket can cross houses, one payment, one standard held
            against all of them.
          </p>
          <div className="mp-hero-actions">
            <button className="mp-btn">Shop the catalog</button>
            <button className="mp-btn accent-outline">Apply as a house</button>
          </div>
        </div>
      </div>

      <div className="mp-roster">
        <p className="label">Houses on Vitrine</p>
        <div className="mp-roster-row">
          {houses.map((h) => (
            <span key={h} className="mp-serif-i">
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="mp-section">
        <p className="label">Shop by category</p>
        <div className="mp-cat-grid">
          {homeCategories.map((c) => (
            <MediaTile
              key={c.name}
              tone={c.tone}
              kind={c.kind}
              title={c.name}
            />
          ))}
        </div>
      </div>

      <div className="mp-section">
        <p className="label">Curated collections</p>
        <p className="intro mp-serif">
          Rotating edits, chosen by hand, never by algorithm.
        </p>
        <div className="mp-coll-grid">
          {homeCollections.map((c) => (
            <MediaTile
              key={c.name}
              tone={c.tone}
              kind={c.kind}
              title={c.name}
              subtitle={c.sub}
            />
          ))}
        </div>
      </div>

      <div className="mp-close">
        <p className="statement mp-serif">
          Anyone with the money can buy. Not everyone gets to sell.
        </p>
        <div className="apply-block">
          <h3 className="mp-serif">For houses & tastemakers</h3>
          <p>
            We review every application, and every product after it. Customers
            here are trusting Vitrine, not just your name.
          </p>
          <button className="mp-btn accent-outline">Apply to sell</button>
        </div>
      </div>
    </div>
  )
}

function CatalogPage() {
  const [active, setActive] = useState("All")
  const shown =
    active === "All"
      ? catalogProducts
      : catalogProducts.filter((p) => p.category === active)
  return (
    <div className="mp-wrap">
      <SiteNav current="Catalog" />
      <div className="cat-header">
        <h1 className="mp-serif">The full catalog</h1>
        <p>
          Every piece across every house, reviewed one at a time before it
          landed here.
        </p>
      </div>
      <div className="filter-bar">
        <div className="filter-pills">
          {catalogFilters.map((f) => (
            <button
              key={f}
              className={`filter-pill ${active === f ? "active" : ""}`}
              onClick={() => setActive(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <select className="sort-select" defaultValue="newest">
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
        </select>
      </div>
      <p className="catalog-count">
        {shown.length} piece{shown.length === 1 ? "" : "s"}
      </p>
      <div className="catalog-grid">
        {shown.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>
    </div>
  )
}

function AboutPage() {
  return (
    <div className="mp-wrap">
      <SiteNav current="About" />
      <div className="about-hero">
        <h1 className="mp-serif">
          A vitrine is a window. Only the best pieces get to sit in it.
        </h1>
        <p className="about-copy">
          Vitrine exists because most marketplaces optimize for volume — anyone
          can list, an algorithm decides what you see. We built the opposite: a
          small number of houses, each reviewed by hand, each held to the same
          standard on stock, shipping and returns.
        </p>
        <p className="about-copy">
          Customers shop freely. Houses earn their place, and keep it by staying
          good.
        </p>
      </div>

      <div className="about-stats">
        <div className="stat">
          <p className="big mp-serif">212</p>
          <p className="cap">Applications reviewed this year</p>
        </div>
        <div className="stat">
          <p className="big mp-serif">34</p>
          <p className="cap">Houses accepted</p>
        </div>
        <div className="stat">
          <p className="big mp-serif">9 days</p>
          <p className="cap">Average review time</p>
        </div>
      </div>

      <p className="about-steps-label">How a house gets on Vitrine</p>
      <div className="about-steps">
        <div className="about-step">
          <p className="num mp-serif">01</p>
          <h4>Apply</h4>
          <p>
            A house submits its story, its standards, and a sample of the work.
          </p>
        </div>
        <div className="about-step">
          <p className="num mp-serif">02</p>
          <h4>Review</h4>
          <p>
            We check quality, fulfilment and fit. Most applications don't clear
            this.
          </p>
        </div>
        <div className="about-step">
          <p className="num mp-serif">03</p>
          <h4>On Vitrine</h4>
          <p>
            Approved houses list their pieces; we approve every one before
            customers see it.
          </p>
        </div>
      </div>

      <div className="mp-close">
        <p className="statement mp-serif">
          Think your work belongs in the window?
        </p>
        <div className="apply-block">
          <h3 className="mp-serif">Apply as a house</h3>
          <p>
            Tell us who you are and what you make. We reply to every
            application.
          </p>
          <button className="mp-btn accent-outline">
            Start an application
          </button>
        </div>
      </div>
    </div>
  )
}

function EntityPage({
  type,
  breadcrumb,
  eyebrow,
  title,
  story,
  kind,
  tone,
  meta,
  shelfLabel,
  products,
  note,
}) {
  return (
    <div className="mp-wrap">
      <SiteNav current={type === "vendor" ? "Houses" : undefined} />
      <p className="breadcrumb">{breadcrumb}</p>

      <div className="ep-header-media">
        <MotifMedia tone={tone} kind={kind} />
      </div>

      <div className="ep-header">
        <p className="ep-eyebrow">{eyebrow}</p>
        <h1 className="mp-serif">{title}</h1>
        <p className="story">{story}</p>
      </div>

      <div className="ep-meta">
        {meta.map((m, i) => (
          <div className="ep-meta-item" key={i}>
            <m.icon size={15} /> {m.label}
          </div>
        ))}
      </div>

      <p className="ep-shelf-label">{shelfLabel}</p>
      <div className="ep-grid">
        {products.map((p) => (
          <ProductCard key={p.name} p={p} />
        ))}
      </div>

      {note && <div className="ep-note">{note}</div>}
    </div>
  )
}

function AccountPage() {
  return (
    <div className="mp-wrap">
      <SiteNav current="Account" />
      <div className="acct-header">
        <h1 className="mp-serif">Your account</h1>
        <p className="sub">Signed in as jules@example.com</p>
      </div>

      <div className="acct-section">
        <p className="label">Order history</p>
        <div className="order-card">
          <div className="order-head">
            <span className="oid">Order #V-1042</span>
            <span className="odate">Sep 2 · $845.00</span>
          </div>
          <div className="consign-row">
            <span>Maren Larkin</span>
            <span className="status-chip shipped">Shipped</span>
          </div>
          <div className="consign-row">
            <span>Coeur Atelier</span>
            <span className="status-chip processing">Processing</span>
          </div>
        </div>
        <div className="order-card">
          <div className="order-head">
            <span className="oid">Order #V-1031</span>
            <span className="odate">Aug 20 · $460.00</span>
          </div>
          <div className="consign-row">
            <span>North & Ansel</span>
            <span className="status-chip delivered">Delivered</span>
          </div>
        </div>
      </div>

      <div className="acct-section">
        <p className="label">Following</p>
        <div className="mp-roster-row">
          {["Maren Larkin", "Coeur Atelier", "North & Ansel"].map((h) => (
            <span key={h} className="mp-serif-i">
              {h}
            </span>
          ))}
        </div>
      </div>

      <div className="acct-section">
        <p className="label">Account details</p>
        <div className="acct-info-grid">
          <div>
            <p className="k">Name</p>
            <p className="v">Jules Bennett</p>
          </div>
          <div>
            <p className="k">Email</p>
            <p className="v">jules@example.com</p>
          </div>
          <div>
            <p className="k">Shipping address</p>
            <p className="v">14 Columbia Road, London</p>
          </div>
          <div>
            <p className="k">Payment on file</p>
            <p className="v">Visa ending 4471</p>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <button className="mp-btn outline">Sign out</button>
        </div>
      </div>
    </div>
  )
}

const vendorExample = {
  type: "vendor",
  breadcrumb: "Home / Houses / Maren Larkin",
  eyebrow: "Fine jewelry · London",
  title: "Maren Larkin",
  story:
    "Hand-forged in a single studio off Columbia Road. Every piece is cast in small runs, never reordered once a run sells out — what you see is what exists.",
  kind: "ring",
  tone: "#2E3A44",
  meta: [
    { icon: ShieldCheck, label: "Reviewed & approved house" },
    { icon: Truck, label: "Ships from Vitrine's own network" },
    { icon: Clock, label: "Dispatch in 2 days" },
  ],
  shelfLabel: "Maren's shelf",
  products: marenPieces,
  note: "Buying from Maren alongside another house? It still arrives as one order, one payment — Vitrine holds the promise, not the individual house.",
}

const categoryExample = {
  type: "category",
  breadcrumb: "Home / Categories / Jewelry",
  eyebrow: "Category",
  title: "Jewelry",
  story:
    "Cast, forged and set by hand. Every piece in this category comes from a house that passed the same review, whatever their name.",
  kind: "ring",
  tone: "#2E3A44",
  meta: [{ icon: Tag, label: "48 pieces across 3 houses" }],
  shelfLabel: "In this category",
  products: jewelryCategoryProducts,
  note: null,
}

const collectionExample = {
  type: "collection",
  breadcrumb: "Home / Collections / The Winter Edit",
  eyebrow: "Curated collection",
  title: "The Winter Edit",
  story:
    "Pulled by hand across categories for the season — not an algorithm's idea of what goes together, ours.",
  kind: "branch",
  tone: "#5B3A56",
  meta: [
    { icon: Sparkles, label: "Curated by Vitrine" },
    { icon: Clock, label: "Updated weekly" },
  ],
  shelfLabel: "In this edit",
  products: winterEditProducts,
  note: null,
}

export default function VitrineDemo() {
  const [view, setView] = useState("home")
  const [entityType, setEntityType] = useState("vendor")

  const entityData =
    entityType === "vendor"
      ? vendorExample
      : entityType === "category"
        ? categoryExample
        : collectionExample

  return (
    <div className="mp-app">
      <style>{CSS}</style>
      <div className="mp-grain" />
      <div className="top-switcher-row">
        <div className="top-switcher">
          <button
            className={view === "home" ? "active" : ""}
            onClick={() => setView("home")}
          >
            Home
          </button>
          <button
            className={view === "catalog" ? "active" : ""}
            onClick={() => setView("catalog")}
          >
            Catalog
          </button>
          <button
            className={view === "entity" ? "active" : ""}
            onClick={() => setView("entity")}
          >
            Vendor / Category / Collection
          </button>
          <button
            className={view === "about" ? "active" : ""}
            onClick={() => setView("about")}
          >
            About
          </button>
          <button
            className={view === "account" ? "active" : ""}
            onClick={() => setView("account")}
          >
            Account
          </button>
        </div>
      </div>
      {view === "entity" && (
        <div className="sub-switcher-row">
          <div className="sub-switcher">
            <button
              className={entityType === "vendor" ? "active" : ""}
              onClick={() => setEntityType("vendor")}
            >
              Vendor
            </button>
            <button
              className={entityType === "category" ? "active" : ""}
              onClick={() => setEntityType("category")}
            >
              Category
            </button>
            <button
              className={entityType === "collection" ? "active" : ""}
              onClick={() => setEntityType("collection")}
            >
              Collection
            </button>
          </div>
        </div>
      )}

      {view === "home" && <HomePage />}
      {view === "catalog" && <CatalogPage />}
      {view === "entity" && <EntityPage {...entityData} />}
      {view === "about" && <AboutPage />}
      {view === "account" && <AccountPage />}
    </div>
  )
}
