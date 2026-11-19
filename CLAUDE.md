# CLAUDE.md — Grant Luther Portfolio (6rant.com)

Persistent context, design guardrails, and deployment rules for Claude sessions in this repo.

---

## 1. Project & Deployment Pipeline

- **Site:** Personal photography and design portfolio for Grant Luther — **6rant.com**.
- **Repo:** `github.com/gluther/portfolio`, default branch `main`.
- **CI/CD:** GitHub `main` is connected directly to Netlify. **Every push/merge to `main` triggers a live production deploy to 6rant.com.** Treat any push to `main` as shipping to production. Commit/push only when Grant asks.

### Actual stack (verified 2026-11-18)

> ⚠️ The stack is **not** Next.js / TypeScript / Tailwind. It is a **static, hand-written HTML/CSS/JS site** with no build step. Do not introduce a framework, `package.json`, or Tailwind classes unless Grant explicitly asks for a migration.

- **No build tooling:** no `package.json`, `netlify.toml`, `tsconfig.json`, or Tailwind config. Netlify serves the repo root as-is.
- **Pages (repo root):**
  - `index.html` — homepage (hero marquee + featured collections). Has a large inline `<style>` block (homepage-only overrides, scoped via `.agency-home`) and an inline `<script>` near the bottom (custom cursor, etc.).
  - `photography.html`, `design.html`, `about.html` — section/landing pages.
  - Photography collections: `colorado.html`, `copenhagen.html`, `croatia.html`, `ecuador.html`, `greece.html`, `lisbon.html`, `nj.html`, `nyc.html`, `san francisco.html` (note the space in the filename), `singapore.html`, `spain.html`, `thailand.html`.
  - Design/client projects: `gazelle.html`, `independent.html`, `livgolf.html`, `mls.html`.
- **Shared styles:** `style.css` (~90 KB) — global styles for all pages, including the shared hero grid (`.hero-background-grid`, `.background-grid-container`, `.hero-heading-ghost`) and `@media (max-width: 768px)` mobile rules.
- **Images:** `images/<collection>/<collection>-N.jpg` (e.g. `images/nj/nj-7.jpg`, `images/greece/greece-12.jpg`). Note `images/sf/` backs `san francisco.html`; `images/about/` holds `favicon.png`, `opengraph.jpg`, logos (`livgolflogo.jpg`, `mlslogo.svg`) and a video. Some extensions are uppercase (e.g. `nj-9.JPG`) — Netlify paths are **case-sensitive**, so match exactly.
- **Navigation is duplicated in every HTML file** (desktop nav + mobile menu). Adding a page/collection (e.g. Lisbon) means updating the nav `<ul>` in **every** `.html` file, both menus.
- **Fonts:** Google Fonts — `Space Grotesk` (sans) + `Instrument Serif` (italic accents) loaded in `<head>`. `style.css` also declares `@font-face` for `Clash Display` pointing to `fonts/…`, but **the `fonts/` directory does not exist** (dead reference).
- **Other:** `.cursorrules` holds older generic frontend-design guidance; this file takes precedence where they conflict. `og:url` in `index.html` still points to `grantluther.com`, not `6rant.com`.

### Build hygiene (static-site equivalent of `npm run build`)

There is no build to run, so before finalizing changes:

1. **Check for broken local asset paths** (images, CSS, links) across all pages:
   ```bash
   for f in *.html; do grep -oE '(src|href)="[^"#:]+"' "$f" | sed -E 's/^(src|href)="//; s/"$//' | while read -r p; do [ -e "$p" ] || echo "$f -> missing: $p"; done; done
   ```
2. **Preview locally** and check desktop + mobile (< 768px) widths, and the browser console for errors:
   ```bash
   python3 -m http.server 8000
   ```
3. Keep inline `<style>`/`<script>` in `index.html` and shared rules in `style.css` consistent — know which file wins before editing (homepage inline styles override `style.css`).
4. Don't commit `.DS_Store` or unrelated working-tree changes; stage only the files the change touches.

---

## 2. Brand & Aesthetic Direction

- **Vibe:** Award-winning, modern editorial portfolio (Awwwards caliber). Favor atmospheric depth, intentional typography contrast, and clean negative space over generic templates or dated effects. **No** fake lens flares, metallic text gradients, or heavy drop shadows.
- **Color palette (target):**
  - Hero canvas: deep midnight navy / off-black `#0a0b10` (already used in `style.css` hero background).
  - Typography: crisp white / off-white `#ffffff` / `#f8f8f8`.
  - Content: clean white rounded content card (`border-radius: 40px 40px 0 0`, i.e. the `rounded-t-[40px]` look) overlapping the hero below the fold.
  - Note: `index.html` `:root` currently defines an older palette (`--charcoal #1A1A1A`, `--warm-mahogany #7A2E2A`, `--cloud-dancer #F0EEE9`, etc.) and the hero overlay uses a mahogany-tinted gradient. Migrate toward the target palette when touching those areas.
- **Typography (target):** Expressive display face (**Syne** or **Bricolage Grotesque**) for major headings, paired with clean, wide-tracked uppercase sans labels for subheadings (`PHOTOGRAPHY AND DESIGN`) and navigation (`HOME`, `PHOTOGRAPHY +`, `DESIGN +`, `ABOUT`). Currently the site uses Space Grotesk + Instrument Serif; switching display fonts means updating the Google Fonts `<link>` in every page.
- Since there is no Tailwind, Tailwind-style values in this doc (e.g. `bg-black/40`, `tracking-[0.2em]`) describe the **intended CSS values**; implement them in plain CSS.

---

## 3. Hero Section Technical Guardrails

Hero markup lives in `index.html` (`<header class="hero-section">`), styled by the inline `<style>` in `index.html` (overrides) and `style.css` (~lines 1300–1600).

- **3D perspective marquee — keep this hierarchy intact:**
  ```
  .hero-background-grid        → outer wrapper with `perspective` (1200px inline / 1500px in style.css)
    .background-grid-container → inner `translate(-50%,-50%) rotateX(25deg) scale(1.8)`, preserve-3d, width: max-content
      .background-grid-row.row-1  → scrollLeft   (180s linear infinite)
      .background-grid-row.row-2  → scrollRight
      .background-grid-row.row-3  → scrollLeft
    .background-grid-gradient
  .hero-background-overlay     → dark overlay
  ```
  Rows are `width: max-content` and animate `translateX(0 → -50%)`, so **each row's image list must be duplicated (set A + identical set A)** for a seamless loop. When editing styles/animations, preserve perspective wrapper → rotateX container (with scale compensation) → three `max-content` rows, or the grid collapses/stretches.
- **Background photography:** Pull evenly from the full pool — `nj-7`, `nj-18`, `nj-19`, `greece-12`, `croatia-18`, `croatia-12`, `colorado-23` (all exist under `images/<collection>/`) — shuffled across rows so the same image never stacks vertically in adjacent rows. Sit beneath a subtle dark overlay of `rgba(0,0,0,0.4)`–`rgba(0,0,0,0.5)`. (Rows currently also include other images like `colorado-24`, `singapore-20`, `thailand-14`, `nyc-11`, and `nj-19` is not yet used.)
- **Responsive balance:**
  - Desktop: `GRANT LUTHER` on a single horizontal line.
  - Mobile (`max-width: 768px`): stack `GRANT` over `LUTHER` with `line-height: 1.1`; hide the ghost text (`.hero-heading-ghost { display: none }` — already done in `style.css`); keep subheading tracking compact (`letter-spacing: 0.2em`); use a tailored 3D scale of ~`1.25` so portrait screens aren't overly zoomed.
  - Note: current mobile scales are higher than target — `index.html` uses `scale(2.0)` @ ≤1024px and `scale(2.4)` @ ≤768px/480px; `style.css` uses `scale(1.90)` @ ≤768px. Reconcile toward ~1.25 and confirm which rule actually applies.
- Respect `prefers-reduced-motion` if adding new motion; the custom cursor is already hidden on `(hover: none)` devices.
