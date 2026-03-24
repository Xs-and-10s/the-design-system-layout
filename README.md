# @the-design-system/layout

**26 declarative custom-element layout primitives. Zero build step for consumers. Zero specificity conflicts. One coherent design-token system.**

```html
<!-- All you need to start -->
<script type="module"
  src="https://cdn.jsdelivr.net/npm/@the-design-system/layout/dist/register-all.min.js">
</script>
<link rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@the-design-system/layout/dist/core.min.css">
```

```html
<!-- A real layout, in full -->
<region-layout pad-block="xl" pad-inline="l">
  <stacked-layout gap="l">
    <repel-layout>
      <h1>Dashboard</h1>
      <cluster-layout gap="s">
        <button>Export</button>
        <button>New project</button>
      </cluster-layout>
    </repel-layout>

    <columns-layout cols="2fr 1fr 1fr" gap="m">
      <quadrilateral-layout class="card" pad="l" radius="s" border="1px solid currentColor">
        <stacked-layout gap="s">
          <span class="label">Monthly Revenue</span>
          <div class="stat">$2.4M</div>
          <span class="delta">↑ 18% vs last month</span>
        </stacked-layout>
      </quadrilateral-layout>
      <!-- more cards -->
    </columns-layout>
  </stacked-layout>
</region-layout>
```

---

## Contents

- [Why this exists](#why-this-exists)
- [Quick start — three paths](#quick-start)
- [The 26 primitives](#the-26-primitives)
- [Design tokens](#design-tokens)
- [Composition patterns](#composition-patterns)
- [Advanced usage](#advanced-usage)
- [For agents and LLMs](#for-agents-and-llms)
- [API reference](#api-reference)
- [Browser support](#browser-support)
- [Contributing](#contributing)

---

## Why this exists

Most CSS layout systems make you choose between two bad options:

**Option A: utility classes** — you write `flex flex-col gap-4 px-6 md:flex-row` and hope your editor's Tailwind intellisense is working. The layout intent is invisible in the HTML.

**Option B: component frameworks** — you get `<Box display="flex" flexDirection="column">`. Now layout is visible, but it's locked to a framework and brings a runtime cost.

This library is a third option: **layout as custom HTML elements**. Every element maps directly to a layout algorithm — `<stacked-layout>` is a flex column with a gap, `<repel-layout>` pushes its two children apart, `<split-layout>` switches from row to column at a threshold. The HTML reads like a layout spec.

**Key properties:**

- **No build step for consumers.** Drop a `<script>` tag, get layout. Works in vanilla HTML, any framework, or a Datastar hypermedia app.
- **Zero specificity.** Every CSS rule is wrapped in `:where()`. Your own styles always win. No `!important` wars.
- **One coherent token system.** Spacing, type scale, and layout thresholds all derive from a single `--ds-ratio` value. Change the ratio, every scale updates.
- **Intrinsic-first.** Layouts respond to available space, not viewport breakpoints. Use `split-layout` instead of `@media` queries. Reach for `breakpoint-layout` only as a last resort.
- **Print-aware.** `prose-layout` includes `@media print` styles automatically.
- **Tree-shakeable.** Import only the modules you use. Each module is a standalone CSS + JS pair.

---

## Quick start

### Path 1 — CDN (no build step)

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@the-design-system/layout/dist/core.min.css">
</head>
<body>
  <stacked-layout gap="m">
    <h1>Hello</h1>
    <p>Content here</p>
  </stacked-layout>

  <script type="module"
    src="https://cdn.jsdelivr.net/npm/@the-design-system/layout/dist/register-all.min.js">
  </script>
</body>
</html>
```

That's it. No npm, no bundler, no config.

### Path 2 — npm + bundler

```bash
npm install @the-design-system/layout
```

```js
// Register only what you need (recommended — tree-shakeable)
import { define as defineStacked }  from '@the-design-system/layout/stacked';
import { define as defineCentered } from '@the-design-system/layout/centered';
import { define as defineRegion }   from '@the-design-system/layout/region';

defineStacked();
defineCentered();
defineRegion();
```

```css
/* In your root stylesheet */
@import '@the-design-system/layout/core.css';
@import '@the-design-system/layout/stacked/stacked.css';
@import '@the-design-system/layout/centered/centered.css';
@import '@the-design-system/layout/region/region.css';
```

Or register everything at once:

```js
import '@the-design-system/layout/register-all';
```

### Path 3 — Datastar / hypermedia apps

```html
<!-- Works seamlessly with Datastar signals -->
<containment-layout name="sidebar">
  <stacked-layout gap="m">
    <presence-layout box animate="entry" data-state="$sidebarOpen">
      <nav>…</nav>
    </presence-layout>
  </stacked-layout>
</containment-layout>
```

`presence-layout` reads `data-state` directly from the DOM — set it from a Datastar signal, vanilla JS, or any framework. The library never calls `setState` or owns any reactive state.

---

## The 26 primitives

### Spacing & flow

| Element | What it does |
|---|---|
| `stacked-layout` | Flex column with consistent gap. The workhorse. |
| `cluster-layout` | Wrapping flex row — tags, buttons, chips. |
| `repel-layout` | Two children pushed apart (`justify-content: space-between`). |
| `bookend-layout` | Three-column grid: `auto 1fr auto`. Nav bars, header rows. |
| `region-layout` | Sets block/inline padding and establishes `--ds-region-pad-inline` for descendants. |

### Responsive layout

| Element | What it does |
|---|---|
| `split-layout` | Switches from row to column at a CSS length threshold. No media queries. |
| `split-pane-layout` | Named-area CSS Grid from a `panes="A B / C D"` string. |
| `pane-layout` | Child of `split-pane-layout`. Maps to a named grid area. |
| `columns-layout` | Explicit column grid. Accepts `cols="2fr 1fr"` or a count. |
| `rows-layout` | Explicit row grid. Accepts `rows="3"` or a track template. |
| `fluid-grid-layout` | Auto-column grid from a minimum width. No breakpoints. |
| `sandwich-layout` | Three-row full-height grid: header / `1fr` / footer. App shells. |
| `scrolling-layout` | Vertical or horizontal scroll container with optional snap. |
| `masonry-layout` | Multi-column masonry via CSS `columns`. Native masonry where supported. |
| `breakpoint-layout` | Viewport-breakpoint conditional rendering (last resort — use intrinsic tools first). |
| `at-breakpoint` | Child of `breakpoint-layout`. Declares `min`, `max`, and `orientation` conditions. |

### Content & surface

| Element | What it does |
|---|---|
| `centered-layout` | Max-width centering with `margin-inline: auto`. |
| `breakout-layout` | Breaks out of a `region-layout`'s padding for full-bleed content. |
| `breakin-layout` | Re-constrains breakout content to a narrower measure. |
| `containment-layout` | CSS container query scope, containment, and `content-visibility`. |
| `quadrilateral-layout` | Box model surface: padding, border, radius, background, shadow, and transforms. |
| `prose-layout` | Flow rhythm for mixed HTML content: paragraphs, lists, headings, code, tables. |

### Stacking & motion

| Element | What it does |
|---|---|
| `z-axis-layout` | Stacks children in the same grid cell. Overlapping layouts without `position: absolute`. |
| `overlay-layout` | Absolutely (or fixedly) positioned layer. |
| `aspect-ratio-layout` | Preserves aspect ratio. Children fill the box. |
| `sticky-layout` | `position: sticky` with logical edge attributes. |
| `icon-text-layout` | Inline-flex icon + text pair. Icon is always 1em square. |
| `presence-layout` | 3-step visibility state machine: absent ↔ invisible ↔ visible. Animated transitions. |

---

## Design tokens

All tokens are CSS custom properties set on `:root`. You override them with standard CSS — no config files, no JS.

### Space scale

The space scale derives from a single fluid base value and a ratio:

```css
/* core.css default */
--ds-ratio:      clamp(1.3333, /* fluid */, 1.5);  /* perfect-fourth → perfect-fifth */
--ds-space-base: clamp(1rem, 0.85rem + 0.6vw, 1.5rem);

/* The 11-step scale */
--ds-space-tiny  --ds-space-xxxs  --ds-space-xxs  --ds-space-xs  --ds-space-s
--ds-space-m     --ds-space-l     --ds-space-xl   --ds-space-xxl --ds-space-xxxl
--ds-space-huge

/* Half-step pairs (smaller-to-larger) */
--ds-space-xs-s   --ds-space-s-m   --ds-space-m-l
--ds-space-l-xl   --ds-space-xl-xxl

/* Inverse scale (larger-on-small-screens, smaller-on-large — ideal for touch targets) */
--ds-space-m-s   --ds-space-l-m   --ds-space-xl-l
```

Token names are used directly as attribute values:

```html
<stacked-layout gap="m">          <!-- --ds-space-m -->
<stacked-layout gap="s-m">        <!-- --ds-space-s-m (half-step) -->
<region-layout pad-block="xl">    <!-- --ds-space-xl -->
```

### Ratio presets

Apply a class to any element to change the scale for that subtree:

```html
<!-- Musical interval ratios -->
<section class="perfect-fifth">   <!-- ratio: 1.5 (fixed)         -->
<section class="golden">          <!-- ratio: 1.618 (golden ratio) -->
<section class="minor-third">     <!-- ratio: 1.2                  -->

<!-- Or override directly -->
<section style="--ds-ratio-min: 1.25; --ds-ratio-max: 1.618;">
  <!-- Fluid between perfect-fourth and golden across viewport -->
</section>
```

### Type scale

```css
--ds-text-xs  --ds-text-s  --ds-text-m  --ds-text-l
--ds-text-xl  --ds-text-xxl  --ds-text-xxxl  --ds-text-huge

/* Decouple from space scale */
:root { --ds-text-ratio: 1.25; }  /* tighter type scale, same space scale */
```

### Color slots

```css
/* System color defaults — adapt to light/dark automatically */
--ds-color-surface:    Canvas;
--ds-color-on-surface: CanvasText;
--ds-color-border:     currentColor;
--ds-color-accent:     Highlight;
--ds-color-muted:      GrayText;
```

---

## Composition patterns

### App shell

```html
<sandwich-layout>
  <sticky-layout bs="0">
    <header>
      <repel-layout>
        <span class="logo">Acme</span>
        <nav><cluster-layout gap="m">…links…</cluster-layout></nav>
      </repel-layout>
    </header>
  </sticky-layout>

  <scrolling-layout>
    <region-layout pad-block="xl" pad-inline="l">
      <centered-layout max="80ch">
        <stacked-layout gap="l">…page content…</stacked-layout>
      </centered-layout>
    </region-layout>
  </scrolling-layout>

  <footer>…</footer>
</sandwich-layout>
```

### Sidebar + main

```html
<split-pane-layout panes="S M" cols="220px 1fr" style="block-size:100dvh">
  <pane-layout area="S" class="sidebar">
    <stacked-layout gap="0">…nav links…</stacked-layout>
  </pane-layout>
  <pane-layout area="M">
    <scrolling-layout>
      <region-layout>…main content…</region-layout>
    </scrolling-layout>
  </pane-layout>
</split-pane-layout>
```

### Responsive card grid

```html
<!-- Columns emerge from content width. No breakpoints. -->
<fluid-grid-layout min="280px" gap="m">
  <quadrilateral-layout pad="l" radius="s" border="1px solid currentColor">
    Card content
  </quadrilateral-layout>
  <!-- more cards -->
</fluid-grid-layout>
```

### Article with pull quote

```html
<region-layout pad-block="xl" pad-inline="xxl">
  <stacked-layout gap="l">
    <centered-layout max="65ch">
      <prose-layout>
        <h1>Article title</h1>
        <p>Opening paragraph…</p>
      </prose-layout>
    </centered-layout>

    <!-- Full-bleed pull quote -->
    <breakout-layout>
      <blockquote style="background: var(--ds-color-surface); padding: var(--ds-space-l) 0; text-align: center">
        "Layout should disappear. The user should only see content."
      </blockquote>
    </breakout-layout>

    <centered-layout max="65ch">
      <prose-layout>
        <p>Continuing paragraph…</p>
      </prose-layout>
    </centered-layout>
  </stacked-layout>
</region-layout>
```

### Animated modal

```html
<presence-layout id="modal" box animate="entry" data-state="absent"
  style="--ds-presence-dur: 280ms">
  <overlay-layout fixed style="background: rgba(0,0,0,0.5)">
    <quadrilateral-layout pad="xl" radius="m" bg="Canvas" shadow="0 8px 32px rgba(0,0,0,0.3)">
      <stacked-layout gap="m">
        <repel-layout>
          <h2>Modal title</h2>
          <button onclick="document.getElementById('modal').hide()">✕</button>
        </repel-layout>
        <prose-layout>
          <p>Modal content here.</p>
        </prose-layout>
      </stacked-layout>
    </quadrilateral-layout>
  </overlay-layout>
</presence-layout>

<button onclick="document.getElementById('modal').show()">Open modal</button>
```

---

## Advanced usage

### Container queries

`containment-layout` makes any element a container query measurement point:

```html
<containment-layout name="card">
  <div class="card-content">…</div>
</containment-layout>
```

```css
@container card (min-inline-size: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
  }
}
```

### Content-visibility optimization

For long pages with many sections, skip rendering of off-screen content:

```html
<!-- Must include contain-intrinsic-size to prevent scroll jump -->
<containment-layout
  content-visibility="auto"
  contain-intrinsic-size="0 600px"
>
  <region-layout>…large section…</region-layout>
</containment-layout>
```

### Quadrilateral transforms

`quadrilateral-layout` supports CSS individual transform properties that compose multiplicatively — applying multiple transforms simultaneously without overwrite:

```html
<!-- Oblique stripe background -->
<quadrilateral-layout skew-x="-4deg" bg="rgba(0,0,0,0.05)"
  style="position:absolute; inset:-20%; pointer-events:none">
</quadrilateral-layout>

<!-- Rotated badge -->
<quadrilateral-layout rotate="45deg" origin="top right"
  bg="red" fg="white" pad="xs" radius="xxs">
  SALE
</quadrilateral-layout>

<!-- All four transforms composing -->
<quadrilateral-layout skew-x="-8deg" rotate="6deg" scale="1.1" translate="4px -6px"
  bg="var(--ds-color-accent)">
  …
</quadrilateral-layout>

<!-- 3D card flip -->
<quadrilateral-layout preserve-3d perspective="600px">
  <quadrilateral-layout rotate="0 1 0 0deg" backface>…front…</quadrilateral-layout>
  <quadrilateral-layout rotate="0 1 0 180deg" backface flip-y>…back…</quadrilateral-layout>
</quadrilateral-layout>
```

### Presence animations

`presence-layout` orchestrates a 3-step state machine: `absent` ↔ `invisible` ↔ `visible`:

```js
const modal = document.querySelector('presence-layout#modal');

// Animated entry (absent → invisible → visible)
await modal.show();

// Animated exit (visible → invisible → absent)
await modal.hide();

// Direct state (no animation)
modal.state = 'visible';

// With View Transitions API (if available, falls back gracefully)
await modal.transitionTo('visible');
```

Configure the animation:

```html
<presence-layout box animate="entry"
  style="
    --ds-presence-dur:        320ms;
    --ds-presence-scale-from: 0.9;
    --ds-presence-offset:     0.5rem;
  ">
  …
</presence-layout>
```

### `breakpoint-layout` — named ranges

Use named ranges instead of manual `min`/`max` values:

```html
<breakpoint-layout>
  <at-breakpoint range="phone">
    <mobile-nav>…</mobile-nav>
  </at-breakpoint>
  <at-breakpoint range="tablet laptop">
    <compact-nav>…</compact-nav>
  </at-breakpoint>
  <at-breakpoint range="desktop wide">
    <full-nav>…</full-nav>
  </at-breakpoint>
</breakpoint-layout>
```

Built-in named ranges (based on 2026 StatCounter device clusters):

| Name | Range | What lives here |
|---|---|---|
| `phone` | 0–479px | Phones in portrait |
| `phone-wide` | 480–767px | Large phones landscape, small tablets |
| `tablet` | 768–1023px | Tablets |
| `laptop` | 1024–1439px | Laptops |
| `desktop` | 1440–1919px | Standard wide desktop |
| `wide` | 1920px+ | Full HD and above |

Multi-name shorthand — space-separated names merge into a single span:

```html
<at-breakpoint range="laptop desktop">  <!-- min:1024px max:1919px -->
```

Numeric ranges also work: `range="480-767"`, `range="1920+"`.

Override the built-in ranges for your project:

```js
import { AtBreakpointElement, DEFAULT_RANGES } from '@the-design-system/layout/breakpoint';

AtBreakpointElement.ranges = {
  ...DEFAULT_RANGES,
  'compact':  { max: '639px' },
  'expanded': { min: '1280px' },
};
```

### Split-pane named areas

Use a `panes` string to define complex grid layouts declaratively:

```html
<!-- IDE layout: header spans full width, three panels below -->
<split-pane-layout panes="H H H / F E O" cols="180px 1fr 240px" rows="40px 1fr">
  <pane-layout area="H">…header…</pane-layout>
  <pane-layout area="F">…file tree…</pane-layout>
  <pane-layout area="E">…editor…</pane-layout>
  <pane-layout area="O">…output…</pane-layout>
</split-pane-layout>
```

### Prose for long-form content

`prose-layout` manages the vertical rhythm inside mixed HTML content:

```html
<centered-layout max="65ch">
  <prose-layout flow="m" flow-heading="xl" leading="1.7">
    <h1>Article title</h1>
    <p>First paragraph. Gets <code>margin: 0</code> — flow rhythm from the owl selector.</p>
    <h2>Section heading</h2>
    <p>Gets extra top margin from <code>flow-heading</code>.</p>
    <ul>
      <li>List items respect <code>li-gap</code></li>
      <li>Nested lists too</li>
    </ul>
    <pre><code>code blocks get padding and border-radius</code></pre>
  </prose-layout>
</centered-layout>
```

`prose-layout` includes print styles automatically — link URL expansion, break-after/inside, orphan/widow control.

---

## For agents and LLMs

This section is written specifically for AI coding assistants consuming this README programmatically.

### Mental model

Every element maps to one layout algorithm. When generating HTML, pick the element whose algorithm matches the intent:

- **linear sequence with gaps** → `stacked-layout`
- **wrapping tag/chip row** → `cluster-layout`
- **two things pushed apart** → `repel-layout`
- **logo | nav | actions** → `bookend-layout`
- **columns at N minimum width, no breakpoints** → `fluid-grid-layout min="Npx"`
- **N explicit columns** → `columns-layout cols="..."`
- **switches orientation at a threshold** → `split-layout threshold="Xrem"`
- **full-height app shell** → `sandwich-layout`
- **stacking layers without absolute positioning** → `z-axis-layout`
- **box with surface styling** → `quadrilateral-layout`
- **long-form prose content** → `prose-layout` wrapping `<p>`, `<ul>`, `<h2>`, etc.
- **container query scope** → `containment-layout`
- **conditional visibility with animation** → `presence-layout`

### Token usage

Attribute values that match a space token name expand to the CSS custom property automatically. You do not write `var(--ds-space-m)` in attributes — you write `m`:

```html
<!-- ✓ correct -->
<stacked-layout gap="m">
<region-layout pad-block="xl" pad-inline="l">
<quadrilateral-layout pad="s" radius="xs">

<!-- ✗ wrong — don't use var() in attributes -->
<stacked-layout gap="var(--ds-space-m)">
```

Valid space token names: `tiny`, `xxxs`, `xxs`, `xs`, `s`, `m`, `l`, `xl`, `xxl`, `xxxl`, `huge`, and the half-step pairs: `xs-s`, `s-m`, `m-l`, `l-xl`, `xl-xxl`.

For `raw`-type attributes (bg, fg, border, etc.), pass the full CSS value:

```html
<quadrilateral-layout
  bg="rgba(0,0,0,0.05)"
  border="1px solid currentColor"
  shadow="0 2px 8px rgba(0,0,0,0.12)"
  radius="s"
  pad="m"
>
```

### What NOT to do

```html
<!-- ✗ don't set layout CSS custom properties via style= on factory elements -->
<!-- the element's connectedCallback will erase them -->
<stacked-layout style="--ds-stacked-gap: 1rem">  <!-- WRONG -->
<stacked-layout gap="m">                          <!-- CORRECT -->

<!-- ✗ don't put block content inside inline-context elements -->
<icon-text-layout>
  <div>icon</div>
  <stacked-layout>...</stacked-layout>  <!-- ok but unusual -->
</icon-text-layout>

<!-- ✗ don't use breakpoint-layout when split-layout or fluid-grid-layout will do -->
<!-- These are intrinsic and better: -->
<split-layout threshold="40rem">...</split-layout>
<fluid-grid-layout min="280px">...</fluid-grid-layout>
```

### Composing patterns

Primitives are designed to nest freely. Common depth patterns:

```html
<!-- 2-deep: spacing + surface -->
<stacked-layout gap="m">
  <quadrilateral-layout pad="l" border="1px solid currentColor" radius="s">
    Card content
  </quadrilateral-layout>
</stacked-layout>

<!-- 3-deep: layout + region + content -->
<sandwich-layout>
  <header>…</header>
  <region-layout pad-block="xl" pad-inline="l">
    <centered-layout max="80ch">
      <prose-layout>…</prose-layout>
    </centered-layout>
  </region-layout>
  <footer>…</footer>
</sandwich-layout>

<!-- 4-deep: full app shell pattern -->
<sandwich-layout>
  <sticky-layout bs="0"><header>…</header></sticky-layout>
  <split-pane-layout panes="S M" cols="240px 1fr">
    <pane-layout area="S"><stacked-layout gap="0">…sidebar…</stacked-layout></pane-layout>
    <pane-layout area="M">
      <scrolling-layout>
        <region-layout pad-block="xl" pad-inline="l">…content…</region-layout>
      </scrolling-layout>
    </pane-layout>
  </split-pane-layout>
  <footer>…</footer>
</sandwich-layout>
```

### Attributes reference summary

Every attribute on every element either takes a **space token name** (`m`, `xl`, `s-m`, …) or a **raw CSS value**. There are no framework-specific types, no boolean props that take strings — HTML booleans are HTML booleans:

```html
<!-- Boolean attributes: presence means true, absence means false -->
<fluid-grid-layout fill>       <!-- fill enabled -->
<scrolling-layout horizontally no-bar snap-horizontally>
<stacked-layout deep>
<quadrilateral-layout preserve-3d backface>
<presence-layout box animate="entry">
<split-layout horizontally>
```

---

## API reference

### `stacked-layout`

Flex column. The primary vertical stacking primitive.

| Attribute | Type | Description |
|---|---|---|
| `gap` | space token \| CSS length | Gap between children. Default: `--ds-gap` |
| `align` | CSS value | `align-items`. Default: `stretch` |
| `[deep]` | boolean | Uses owl selector (`* + *`) instead of flex gap. Lets margin-based children coexist. |

### `cluster-layout`

Wrapping flex row for groups of inline-ish items.

| Attribute | Type | Description |
|---|---|---|
| `gap` | space token \| CSS length | Gap. Default: `--ds-gap` |
| `align` | CSS value | `align-items`. Default: `center` |
| `justify` | CSS value | `justify-content`. Default: `flex-start` |
| `[no-wrap]` | boolean | Disables wrapping |

### `repel-layout`

Pushes exactly two children apart with `justify-content: space-between`.

| Attribute | Type | Description |
|---|---|---|
| `gap` | space token \| CSS length | Minimum gap between children |
| `align` | CSS value | `align-items`. Default: `center` |
| `[wrap]` | boolean | Allows wrapping (useful for responsive header rows) |

### `split-layout`

Switches from row to column at a threshold. Intrinsic responsive — no media queries.

| Attribute | Type | Description |
|---|---|---|
| `threshold` | space token \| CSS length | Width at which it switches. Default: `45rem` |
| `gap` | space token \| CSS length | Gap between children |
| `[horizontally]` | boolean | Forces row, no switching |
| `[vertically]` | boolean | Forces column, no switching |

### `columns-layout`

Explicit multi-column grid.

| Attribute | Type | Description |
|---|---|---|
| `cols` | integer \| track template | `3` → `repeat(3, 1fr)`. Or `"2fr 1fr"`, `"200px 1fr 200px"` |
| `rows` | integer \| track template | Row template. Default: `auto` |
| `gap` | space token \| CSS length | Both axes |
| `gap-block` / `gap-inline` | space token \| CSS length | Per-axis gap |
| `align` | CSS value | `align-items` |
| `[subgrid]` | boolean | `grid-template-columns: subgrid` |

### `rows-layout`

Explicit multi-row grid (transpose of `columns-layout`).

| Attribute | Type | Description |
|---|---|---|
| `rows` | integer \| track template | `5` → `repeat(5, auto)` |
| `cols` | integer \| track template | Column template. Default: `1fr` |
| `gap-block` / `gap-inline` | space token \| CSS length | Per-axis gap |

### `fluid-grid-layout`

Auto-column grid — columns emerge from a minimum width. No breakpoints.

| Attribute | Type | Description |
|---|---|---|
| `min` | space token \| CSS length | Minimum column width. Default: `16rem` |
| `max` | space token \| CSS length | Maximum column width. Default: `1fr` |
| `gap` | space token \| CSS length | Both axes |
| `gap-block` / `gap-inline` | space token \| CSS length | Per-axis gap |
| `columns` | integer | Force a specific column count |
| `align` | CSS value | `align-items` |
| `[fill]` | boolean | Uses `auto-fill` instead of `auto-fit` (columns persist when empty) |

### `sandwich-layout`

Three-row full-height grid: `auto 1fr auto`. App shells.

| Attribute | Type | Description |
|---|---|---|
| `size-bs` | space token \| CSS length | Block-start (header) track size |
| `size-ml` | space token \| CSS length | Middle track size. Default: `1fr` |
| `size-be` | space token \| CSS length | Block-end (footer) track size |
| `min` | CSS length | `min-block-size`. Default: `100dvh` |

### `bookend-layout`

Three-column grid: `auto 1fr auto`. Navigation bars.

| Attribute | Type | Description |
|---|---|---|
| `size-is` | space token \| CSS length | Inline-start (left) track |
| `size-ml` | space token \| CSS length | Middle track. Default: `1fr` |
| `size-ie` | space token \| CSS length | Inline-end (right) track |

### `split-pane-layout` + `pane-layout`

Named-area CSS Grid from a string declaration.

`split-pane-layout` attributes:

| Attribute | Type | Description |
|---|---|---|
| `panes` | string | Grid area template: `"H H / S M"` (space = column, slash = row) |
| `cols` | track template | `grid-template-columns` |
| `rows` | track template | `grid-template-rows` |
| `gap` | space token \| CSS length | Both axes |

`pane-layout` attributes:

| Attribute | Type | Description |
|---|---|---|
| `area` | string | Named area or grid-area shorthand |

### `region-layout`

Padded content region. Sets `--ds-region-pad-inline` for `breakout-layout` to read.

| Attribute | Type | Description |
|---|---|---|
| `pad-block` | space token \| CSS length | Block padding |
| `pad-inline` | space token \| CSS length | Inline padding |
| `bg` | CSS value | Background |

### `centered-layout`

Max-width centering with `margin-inline: auto`.

| Attribute | Type | Description |
|---|---|---|
| `max` | space token \| CSS length | `max-inline-size`. Default: `65ch` |
| `gutter` | space token \| CSS length | `padding-inline` on the element itself |

### `breakout-layout`

Breaks out of a `region-layout`'s padding for full-bleed content.

| Attribute | Type | Description |
|---|---|---|
| `size` | space token \| CSS length | Override the breakout amount (default: matches parent region padding) |
| `pad` | space token \| CSS length | Re-applies padding after breakout |

### `breakin-layout`

Re-constrains breakout content to a narrower measure.

| Attribute | Type | Description |
|---|---|---|
| `max` | space token \| CSS length | `max-inline-size` |
| `gutter` | space token \| CSS length | `padding-inline` |

### `scrolling-layout`

Scroll container with snap and bar control.

| Attribute | Type | Description |
|---|---|---|
| `[horizontally]` | boolean | Horizontal scroll mode (flex row) |
| `item` | space token \| CSS length | Fixed width for horizontal scroll children |
| `gap` | space token \| CSS length | Gap between children (horizontal mode) |
| `peek` | space token \| CSS length | Reveals next item (scroll peek) |
| `pad-inline` | space token \| CSS length | Inline padding |
| `[snap-horizontally]` | boolean | `scroll-snap-type: x mandatory` |
| `[snap-vertically]` | boolean | `scroll-snap-type: y mandatory` |
| `[no-bar]` | boolean | `scrollbar-width: none` |

### `masonry-layout`

CSS multi-column masonry with native masonry enhancement where supported.

| Attribute | Type | Description |
|---|---|---|
| `min` | space token \| CSS length | `column-width`. Default: `16rem` |
| `columns` | integer | Force column count |
| `gap` | space token \| CSS length | Both axes |
| `gap-block` / `gap-inline` | space token \| CSS length | Per-axis gap |

### `containment-layout`

Container query scope, CSS containment, and content-visibility.

| Attribute | Type | Description |
|---|---|---|
| `name` | CSS ident | `container-name` for targeted `@container` rules |
| `type` | `inline-size` \| `size` \| `normal` | `container-type`. Default: `inline-size` |
| `contain` | CSS contain value | `contain` property: `layout`, `paint`, `content`, `strict`, etc. |
| `content-visibility` | `auto` \| `hidden` | Skip off-screen rendering. Pair with `contain-intrinsic-size`. |
| `contain-intrinsic-size` | CSS value | Reserved size when off-screen. E.g. `"0 500px"` |

### `quadrilateral-layout`

Box model surface with optional transforms.

**Padding:** `pad`, `pad-block`, `pad-inline`, `pbs`, `pbe`, `pis`, `pie`
**Border:** `border`, `border-block`, `border-inline`, `border-bs`, `border-be`, `border-is`, `border-ie`
**Radius:** `radius`, `radius-ss`, `radius-se`, `radius-es`, `radius-ee`
**Surface:** `bg`, `fg`, `shadow`
**Transforms:** `skew-x`, `skew-y`, `rotate`, `scale`, `translate`, `origin`, `perspective`
**Boolean transforms:** `[preserve-3d]`, `[backface]`, `[flip-x]`, `[flip-y]`

All padding/radius attributes accept space tokens or CSS lengths. All surface attributes accept raw CSS values.

### `prose-layout`

Flow rhythm for mixed HTML content.

| Attribute | Type | Description |
|---|---|---|
| `measure` | CSS length | `max-inline-size`. Default: `65ch` |
| `leading` | number | `line-height`. Default: `1.65` |
| `flow` | space token \| CSS length | Vertical gap between adjacent children |
| `flow-heading` | space token \| CSS length | Extra top margin before headings |
| `li-gap` | space token \| CSS length | Gap between list items |
| `list-indent` | CSS length | `padding-inline-start` on `ul`/`ol`. Default: `1.25em` |
| `rule-gap` | space token \| CSS length | Margin around `<hr>` |
| `pre-pad` | space token \| CSS length | Padding inside `<pre>` |
| `pre-radius` | space token \| CSS length | Border-radius on `<pre>` |
| `heading-leading` | number | `line-height` on headings. Default: `1.2` |
| `dt-weight` | CSS value | `font-weight` on `<dt>`. Default: `600` |
| `[compact]` | boolean | Reduces all flow values to tighter scale |

### `sticky-layout`

`position: sticky` with logical edge attributes.

| Attribute | Type | Description |
|---|---|---|
| `bs` | space token \| CSS length | `inset-block-start` (top). Default: `0` |
| `be` | space token \| CSS length | `inset-block-end` (bottom) |
| `z` | z-index token \| integer | Z-index. Tokens: `base`, `raised`, `dropdown`, `sticky`, `overlay`, `modal`, `toast` |

### `overlay-layout`

Absolutely or fixedly positioned layer.

| Attribute | Type | Description |
|---|---|---|
| `inset` | space token \| CSS length | `inset` shorthand |
| `align` | CSS value | `align-items` |
| `justify` | CSS value | `justify-items` |
| `z` | z-index token \| integer | Z-index |
| `[fixed]` | boolean | `position: fixed` instead of `absolute` |
| `[stack]` | boolean | Grid-stacks all children in the same cell |
| `[no-events]` | boolean | `pointer-events: none` |

### `z-axis-layout`

Stacks children in the same grid cell (overlapping without `position: absolute`).

| Attribute | Type | Description |
|---|---|---|
| `align` | CSS value | `align-items`. Default: `center` |
| `justify` | CSS value | `justify-items`. Default: `center` |
| `[isolate]` | boolean | `isolation: isolate` — scopes stacking context |

### `aspect-ratio-layout`

Maintains an aspect ratio; children fill the box.

| Attribute | Type | Description |
|---|---|---|
| `ratio` | CSS value | `aspect-ratio`. Default: `16/9`. E.g. `"1"`, `"4/3"`, `"2/1"` |
| `fit` | CSS value | `object-fit` for img/video children. Default: `cover` |

### `icon-text-layout`

Inline-flex icon + text pair. Icon is always `1em × 1em`.

| Attribute | Type | Description |
|---|---|---|
| `gap` | space token \| CSS length | Gap between icon and text |
| `size` | space token \| CSS length | Icon size override |
| `align` | CSS value | `align-items`. Default: `center` |
| `[reverse]` | boolean | Icon appears after text |

### `presence-layout`

3-step visibility state machine with orchestrated transitions.

| Attribute | Type | Description |
|---|---|---|
| `data-state` | `visible` \| `invisible` \| `hidden` \| `absent` | Current state. `absent` = `display:none`. `invisible` = `visibility:hidden`. |
| `[box]` | boolean | `display: block` (required for animations and `vt-name`) |
| `animate` | `"entry"` | Opt into animated transitions |
| `vt-name` | CSS ident | Participates in View Transitions under this name |

CSS animation tokens: `--ds-presence-dur`, `--ds-presence-scale-from`, `--ds-presence-offset`.

JS API: `.show()`, `.hide()`, `.hide('hidden')`, `.transitionTo(state)`, `.state` (getter/setter).

### `breakpoint-layout` + `at-breakpoint`

Viewport-breakpoint conditional rendering. **Use intrinsic tools first** (`split-layout`, `fluid-grid-layout`, `containment-layout`). Reach for this only when markup must structurally differ.

`at-breakpoint` attributes:

| Attribute | Type | Description |
|---|---|---|
| `range` | named \| numeric \| multi-name | Named: `"tablet"`. Numeric: `"768-1023"`. Open-ended: `"1920+"`. Multi-name span: `"laptop desktop"`. |
| `min` | CSS length | `min-width` condition |
| `max` | CSS length | `max-width` condition |
| `orientation` | `any` \| `portrait` \| `landscape` | Orientation condition |

`range` and `min`/`max` are mutually exclusive; `min`/`max` take precedence if both present.

### Universal attributes (all elements)

| Attribute | Type | Description |
|---|---|---|
| `vt-name` | CSS ident | Sets `view-transition-name` for View Transitions API participation |

---

## Browser support

Requires browsers with CSS custom properties, `:where()`, and `customElements`. That's **Chrome 67+, Firefox 63+, Safari 12.1+** for the baseline.

Specific features and their minimum:

| Feature | Minimum |
|---|---|
| Core layout + tokens | Chrome 80, Firefox 75, Safari 14.1 |
| Container queries (`containment-layout`) | Chrome 105, Firefox 110, Safari 16 |
| `content-visibility` | Chrome 85, Firefox 125, Safari 18 |
| `text-wrap: balance` | Chrome 114, Firefox 121, Safari 17.4 |
| `text-wrap: pretty` | Chrome 117, Firefox 127, Safari 18 |
| `@starting-style` (presence entry) | Chrome 117, Firefox 129, Safari 17.5 |
| View Transitions API | Chrome 111, Firefox (partial), Safari 18 |
| CSS masonry (`grid-template-rows: masonry`) | Chrome 131+ (flag), Firefox 126+ (flag) |

All features degrade gracefully. A browser that doesn't support `text-wrap: balance` just uses normal wrapping. An element without View Transitions support still transitions via the CSS opacity/transform animation.

---

## Contributing

The library is built with Bun and LightningCSS.

```bash
git clone https://github.com/Xs-and-10s/the-design-system-layout
cd the-design-system-layout
bun install

# Build everything
bun run build

# CSS only (faster iteration)
bun run build:css

# TypeScript only
bun run build:js

# Watch mode
bun run dev
```

### Repository structure

```
src/
  core.css           # Layer declarations, tokens, reset, motion
  core.ts            # Element factory, normalizers, token allowlists
  register-all.ts    # Side-effectful barrel (CDN entry point)
  <module>/
    <module>.css     # Layer ds.layout rules for this primitive
    <module>.ts      # Custom element class + define()
dist/                # Built output (committed; npm ships this)
poc/                 # Documentation site (not shipped)
scripts/
  build.ts           # Build pipeline (Bun + LightningCSS + tsc)
```

### Adding a new primitive

1. Create `src/<name>/` with `<name>.css` and `<name>.ts`
2. CSS: add rules to `@layer ds.layout { :where(<name>-layout) { … } }`
3. TS: export a `define()` function using `createDesignSystemLayoutElement` or a full class
4. Add the element to `src/register-all.ts`
5. Add the export path to `package.json` `"exports"`

All CSS rules must use `:where()` for zero specificity. All JS attribute-to-var mappings use `createDesignSystemLayoutElement`'s factory pattern — the normalizer handles space token expansion automatically.

---

## License

MIT — © The Design System

```
npm install @the-design-system/layout
```
