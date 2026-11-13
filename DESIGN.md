# TREXO. — DESIGN.md

**Brand:** TREXO.  
**Version:** 2.1 (Black Mode Update)  
**System:** HARD INDUSTRIAL  
**Category:** Machinery & Maintenance  
**Tagline:** TOTAL AVAILABILITY 24/7 — ZERO UNPLANNED DOWNTIME  
**Official Logo:** OPTION 1 — TREXO. with Gear-O  

---

## 1. LOGO

**Primary Lockup:** `TREXO.`

- **Typeface:** HARD INDUSTRIAL DISPLAY (Geometric Sans / Heavy Industrial)
- **Weight:** Black / Heavy (800–900)
- **Case:** All Caps, Condensed
- **Iconography:** The letter `O` is replaced by a 12-tooth gear cog (`Gear-O`)
- **Terminal:** Final `.` is square, matching the exact stroke weight of the characters
- **Restrictions:** No leaves. No plants. No organic elements.

### 1.1 Variations

**A. Black Mode — Primary (Default UI)**
- **Background:** `#0A0B0A` / `#121312`
- **Letters & Period:** `#FFFFFF`
- **Gear-O:** `#A9FC67` (Industrial Lime)

**B. Monochrome Dark**
- **Background:** `#0A0B0A`
- **Full Logo:** `#FFFFFF`

**C. Light Mode**
- **Background:** `#FFFFFF`
- **Full Logo:** `#0A0B0A`

**D. Outline**
- **Background:** Transparent
- **Stroke:** `#FFFFFF` (1.5px–2px solid)
- **Use:** Watermark, laser engraving, metal stamping, embroidery

### 1.2 Isotype

- **Symbol:** `Gear-O` standalone
- **Use:** Favicon, app icon, user avatar badge, patch, cap
- **Specs:** 12 teeth, hollow center, uniform stroke thickness matching main type

### 1.3 Construction & Clearspace

- `GEAR-O = 1X WIDTH`
- Consistent stroke weight across all glyphs
- Sharp 90° angles with subtle industrial chamfered corners
- Locked kerning (tight optical spacing)
- **Clearspace:** Minimum margin equal to the height of `T` on all 4 sides

### 1.4 Misuse

- Do not replace `Gear-O` with a standard letter `O`
- Do not use gray or low-contrast fills on the main wordmark (`TREX.`)
- Do not stretch, skew, rotate, or distort proportions
- Do not add leaves, branches, or eco-themed icons
- Do not use script, rounded, or handwritten fonts
- Do not apply drop shadows, outer glows, or glossy gradients
- Do not place directly over busy photography without a solid dark plate (`#0A0B0A`)

---

## 2. COLOR SYSTEM (BLACK MODE)

| Token | HEX | Role | Usage |
| :--- | :--- | :--- | :--- |
| `obsidian` | `#0A0B0A` | Primary Canvas | Main app background and sidebar |
| `carbon` | `#121413` | Surface / Cards | Metric cards, machinery cards, modals |
| `steel-dark` | `#1D201E` | Elevated / Hover | Active states, input fields, secondary buttons |
| `steel-border` | `#2C302E` | Borders / Dividers | 1px card outlines, table dividers |
| `lime` | `#A9FC67` | Brand Accent | Gear-O, active indicators, status badges (`ASEGURADA`), primary CTAs |
| `white` | `#FFFFFF` | Primary Ink | Logo letters, headings (`Mi flota`), key metrics |
| `ash` | `#9CA3AF` | Secondary Ink | Subtitles, metadata (`2023 • 240 h`), inactive nav items |
| `alert-red` | `#EF4444` | Critical Status | Uninsured alerts (`SIN SEGURO`), fault warnings |

---

## 3. TYPOGRAPHY

### 3.1 Font Stack

- **Display / Headings:** `Barlow Condensed` or `Chakra Petch` (Bold / ExtraBold) — *Industrial, technical, high-legibility*
- **UI / Body:** `Inter` or `Plus Jakarta Sans` (Regular, Medium, SemiBold) — *Clean neo-grotesque for dashboards*
- **Monospace / Telemetry:** `JetBrains Mono` (Medium) — *Engine hours (`1450 h`), years, IDs, serial numbers*

### 3.2 Type Scale

| Role | Size | Weight | Tracking | Case |
| :--- | :--- | :--- | :--- | :--- |
| **Page Title (`Mi flota`)** | `28px / 1.75rem` | `700 Bold` | `-0.02em` | Sentence |
| **Hero Banner (`Asistencia en campo`)** | `24px / 1.5rem` | `700 Bold` | `-0.01em` | Sentence |
| **Section Header (`Maquinaria`)** | `18px / 1.125rem` | `600 SemiBold` | `0em` | Sentence |
| **Card Title (`John Deere S780`)** | `16px / 1rem` | `600 SemiBold` | `0em` | Title |
| **Category Tag (`COSECHADORA`)** | `11px / 0.6875rem` | `700 Bold` | `+0.08em` | ALL CAPS |
| **KPI Big Number (`3`, `2`, `1`)** | `24px / 1.5rem` | `700 Bold` | `-0.02em` | Numeric |
| **Body / Sidebar Nav** | `14px / 0.875rem` | `500 Medium` | `0em` | Sentence |

---

## 4. UI COMPONENTS & LAYOUT

### 4.1 Surfaces & Borders
- **Cards:** Background `#121413` with a `1px solid #2C302E` border and `8px` border-radius (sharp, functional geometry).
- **Brushed Metal Texture (Optional):** Subtle dark metallic grain overlay at `4%–6%` opacity on hero and KPI banners.

### 4.2 Buttons
- **Primary CTA:** Solid `#A9FC67` fill, `#0A0B0A` bold text, `6px` radius, `0px` shadow.
- **Secondary / Ghost CTA (`+ Nueva máquina`):** `#121413` fill, `1px solid #2C302E` border, `#FFFFFF` text. Hover state shifts border to `#A9FC67`.

### 4.3 Status Pills
- **Insured (`ASEGURADA`):** `#16291A` background, `#A9FC67` text & border (`1px`), `4px` radius.
- **Uninsured (`SIN SEGURO`):** `#2D1616` background, `#F87171` text & border (`1px`), `4px` radius.
- **Demo Mode (`Modo demo`):** `#A9FC67` pill badge with `#0A0B0A` text for high visibility in top bar.

### 4.4 Iconography
- **Style:** Linear / Outlined industrial icons (`1.5px` stroke), rounded caps, crisp corners (e.g., Lucide Icons or Phosphor Regular).

---

## 5. LOGO ASSETS

- `dist/assets/trexo.svg` — primary lockup `TREXO.` with Gear-O and square period (Black Mode: white letters, lime gear).
- `dist/assets/gear-o.svg` — Gear-O isotype (favicon / app icon / avatar badge).

### 5.1 Primary Lockup (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 475 130" width="475" height="130" fill="none">
  <g fill="#FFFFFF">
    <path d="M 12,18 H 84 V 35 H 58 V 112 H 38 V 35 H 12 Z" />
    <path d="M 96,18 H 144 C 161,18 171,27 171,44 C 171,57 164,66 152,70 L 173,112 H 151 L 133,73 H 116 V 112 H 96 Z M 116,34 V 57 H 141 C 148,57 152,52 152,45.5 C 152,39 148,34 141,34 Z" />
    <path d="M 186,18 H 252 V 35 H 206 V 56 H 246 V 73 H 206 V 95 H 253 V 112 H 186 Z" />
    <path d="M 263,18 H 286 L 304,49 L 322,18 H 344 L 316,64 L 346,112 H 323 L 304,79 L 285,112 H 262 L 292,64 Z" />
  </g>
  <g fill="#A9FC67">
    <path fill-rule="evenodd" d="M 392.00,26.00 L 396.75,26.29 L 400.25,15.69 L 409.51,18.17 L 407.24,29.10 L 411.50,31.23 L 415.47,33.85 L 423.80,26.42 L 430.58,33.20 L 423.15,41.53 L 425.77,45.50 L 427.90,49.76 L 438.83,47.49 L 441.31,56.75 L 430.71,60.25 L 431.00,65.00 L 430.71,69.75 L 441.31,73.25 L 438.83,82.51 L 427.90,80.24 L 425.77,84.50 L 423.15,88.47 L 430.58,96.80 L 423.80,103.58 L 415.47,96.15 L 411.50,98.77 L 407.24,100.90 L 409.51,111.83 L 400.25,114.31 L 396.75,103.71 L 392.00,104.00 L 387.25,103.71 L 383.75,114.31 L 374.49,111.83 L 376.76,100.90 L 372.50,98.77 L 368.53,96.15 L 360.20,103.58 L 353.42,96.80 L 360.85,88.47 L 358.23,84.50 L 356.10,80.24 L 345.17,82.51 L 342.69,73.25 L 353.29,69.75 L 353.00,65.00 L 353.29,60.25 L 342.69,56.75 L 345.17,47.49 L 356.10,49.76 L 358.23,45.50 L 360.85,41.53 L 353.42,33.20 L 360.20,26.42 L 368.53,33.85 L 372.50,31.23 L 376.76,29.10 L 374.49,18.17 L 383.75,15.69 L 387.25,26.29 Z M 414.00,65.00 A 22.00,22.00 0 1,0 370.00,65.00 A 22.00,22.00 0 1,0 414.00,65.00 Z" />
    <rect x="447" y="92" width="20" height="20" />
  </g>
</svg>
```

### 5.2 Gear-O Isotype (SVG)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="338 11 108 108" width="108" height="108" fill="none">
  <path fill="#A9FC67" fill-rule="evenodd" d="M 392.00,26.00 L 396.75,26.29 L 400.25,15.69 L 409.51,18.17 L 407.24,29.10 L 411.50,31.23 L 415.47,33.85 L 423.80,26.42 L 430.58,33.20 L 423.15,41.53 L 425.77,45.50 L 427.90,49.76 L 438.83,47.49 L 441.31,56.75 L 430.71,60.25 L 431.00,65.00 L 430.71,69.75 L 441.31,73.25 L 438.83,82.51 L 427.90,80.24 L 425.77,84.50 L 423.15,88.47 L 430.58,96.80 L 423.80,103.58 L 415.47,96.15 L 411.50,98.77 L 407.24,100.90 L 409.51,111.83 L 400.25,114.31 L 396.75,103.71 L 392.00,104.00 L 387.25,103.71 L 383.75,114.31 L 374.49,111.83 L 376.76,100.90 L 372.50,98.77 L 368.53,96.15 L 360.20,103.58 L 353.42,96.80 L 360.85,88.47 L 358.23,84.50 L 356.10,80.24 L 345.17,82.51 L 342.69,73.25 L 353.29,69.75 L 353.00,65.00 L 353.29,60.25 L 342.69,56.75 L 345.17,47.49 L 356.10,49.76 L 358.23,45.50 L 360.85,41.53 L 353.42,33.20 L 360.20,26.42 L 368.53,33.85 L 372.50,31.23 L 376.76,29.10 L 374.49,18.17 L 383.75,15.69 L 387.25,26.29 Z M 414.00,65.00 A 22.00,22.00 0 1,0 370.00,65.00 A 22.00,22.00 0 1,0 414.00,65.00 Z" />
</svg>
```
