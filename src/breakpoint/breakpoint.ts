/**
 * @the-design-system/layout — breakpoint-layout + at-breakpoint
 *
 * A viewport-breakpoint conditional rendering primitive.
 * An escape hatch for cases where intrinsic layout, container queries,
 * and fluid scaling cannot achieve the desired result.
 *
 * READ THIS FIRST — prefer intrinsic layout tools:
 *   1. split-layout (auto-switches at threshold)
 *   2. fluid-grid-layout (columns from minimum width)
 *   3. containment-layout (@container queries)
 *   4. split-pane-layout, scrolling-layout
 *   5. breakpoint-layout ← last resort
 *
 * This module defines two custom elements:
 *   <breakpoint-layout> — transparent container, manages children
 *   <at-breakpoint>     — a conditionally-rendered variant
 *
 * ── USAGE: min/max/orientation (full control) ──────────────────────
 *
 *   <breakpoint-layout>
 *     <at-breakpoint max="47.9375rem">
 *       mobile content
 *     </at-breakpoint>
 *     <at-breakpoint min="48rem">
 *       desktop content
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 * ── USAGE: range (convenience shorthand) ──────────────────────────
 *
 *   Named ranges map to built-in breakpoints:
 *
 *   <breakpoint-layout>
 *     <at-breakpoint range="phone">
 *       phone content  (0–479px)
 *     </at-breakpoint>
 *     <at-breakpoint range="tablet">
 *       tablet content  (768–1023px)
 *     </at-breakpoint>
 *     <at-breakpoint range="laptop desktop wide">
 *       large screen content  (1024px+)
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 *   Numeric ranges (px values, no unit needed):
 *
 *   <at-breakpoint range="480-767">  → min:480px max:767px
 *   <at-breakpoint range="1920+">    → min:1920px  (no max)
 *   <at-breakpoint range="0-479">    → max:479px   (no min)
 *
 *   Multi-name shorthand — space-separated names expand to a single
 *   span covering all listed names:
 *
 *   <at-breakpoint range="laptop desktop">
 *   → min:1024px max:1919px  (laptop lower bound to desktop upper bound)
 *
 * ── BUILT-IN NAMED RANGES ─────────────────────────────────────────
 *
 *   Based on 2026 StatCounter device clusters. Boundaries are placed
 *   at the valleys between device clusters, not at device peaks.
 *
 *   Name          Min        Max        What lives here
 *   ─────────────────────────────────────────────────────
 *   phone         —          479px      Phones in portrait  (360–430px cluster)
 *   phone-wide    480px      767px      Large phones landscape, small tablets
 *   tablet        768px      1023px     Tablets  (iPad portrait at 768px)
 *   laptop        1024px     1439px     Laptops  (1280–1366px cluster)
 *   desktop       1440px     1919px     Standard wide desktop
 *   wide          1920px     —          Full HD and above
 *
 * ── CUSTOMIZING NAMED RANGES ──────────────────────────────────────
 *
 *   Override the static lookup before calling define():
 *
 *   import { AtBreakpointElement, DEFAULT_RANGES } from '…/breakpoint';
 *   AtBreakpointElement.ranges = {
 *     ...DEFAULT_RANGES,
 *     'compact':  { max: '639px' },
 *     'expanded': { min: '1280px' },
 *   };
 *
 * ── range vs min/max ──────────────────────────────────────────────
 *
 *   `range` and `min`/`max` are mutually exclusive. If both are present,
 *   `min`/`max` take precedence and a console.warn fires in development.
 *
 * ── ORIENTATION ───────────────────────────────────────────────────
 *
 *   `orientation` can be combined with `range` or `min`/`max`:
 *
 *   <at-breakpoint range="phone" orientation="landscape">
 *
 * @module @the-design-system/layout/breakpoint
 */

import { defineElement, normalizeRaw } from "../core.js";

/* ── Types ───────────────────────────────────────────────────── */

/** Orientation values for the orientation attribute. */
export type BreakpointOrientation = "any" | "portrait" | "landscape";

/**
 * A resolved min/max pair. Either or both may be absent.
 * Absent min = starts from 0; absent max = no upper bound.
 */
export interface BreakpointRange {
  min?: string;
  max?: string;
}

/* ── Built-in named ranges ───────────────────────────────────── */

/**
 * Default named breakpoint ranges based on 2026 device cluster analysis.
 *
 * Boundaries are placed at the valleys between device clusters:
 *   - 480px: gap between phone portrait (360–430px) and phone-wide/small-tablet
 *   - 768px: gap between small tablets and standard tablets (iPad portrait)
 *   - 1024px: gap between tablet landscape and laptop viewports
 *   - 1440px: gap between budget/mid laptops and standard wide desktops
 *   - 1920px: Full HD boundary — 42%+ of desktop traffic at 1920×1080+
 */
const DEFAULT_RANGES: Record<string, BreakpointRange> = {
  // Phones in portrait. Cluster at 360–430px CSS width.
  // 479px gives 50px headroom above the cluster peak (430px).
  phone: { max: "479px" },

  // Large phones in landscape + small tablets in portrait.
  // The range most 2016-era systems ignored. Now covers ~15% of traffic.
  "phone-wide": { min: "480px", max: "767px" },

  // Tablets. iPad portrait anchors at 768px (18-20% of tablet traffic).
  // Upper bound at 1023px — 1024px is where iPad landscape begins.
  tablet: { min: "768px", max: "1023px" },

  // Laptops. iPad landscape (1024), budget laptops (1280), mid laptops (1366).
  // 1440px is the lower bound of "standard wide" desktop.
  laptop: { min: "1024px", max: "1439px" },

  // Standard wide desktop. 1440–1919px covers most desktop monitors.
  // Upper bound at 1919px — 1920px marks Full HD threshold.
  desktop: { min: "1440px", max: "1919px" },

  // Full HD and above. 1920×1080 is the most common desktop resolution
  // globally at ~19% (StatCounter Sep 2025). No upper bound.
  wide: { min: "1920px" },
};

/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Parses a `range` attribute value into a { min?, max? } pair.
 *
 * Accepts:
 *   "phone"              → { max: '479px' }
 *   "tablet"             → { min: '768px', max: '1023px' }
 *   "laptop desktop"     → { min: '1024px', max: '1919px' }  (merged span)
 *   "480-767"            → { min: '480px', max: '767px' }
 *   "1920+"              → { min: '1920px' }
 *   "0-479"              → { max: '479px' }
 *
 * Returns null if the value cannot be parsed or a name is unknown.
 */
function parseRange(
  value: string,
  lookup: Record<string, BreakpointRange>,
): BreakpointRange | null {
  const v = value.trim();
  if (!v) return null;

  // ── Numeric open-ended: "1920+" ───────────────────────────
  const numericOpen = /^(\d+)\+$/.exec(v);
  if (numericOpen) {
    const lo = parseInt(numericOpen[1]!, 10);
    return lo === 0 ? {} : { min: `${lo}px` };
  }

  // ── Numeric range: "480-767" or "0-479" ───────────────────
  const numericRange = /^(\d+)-(\d+)$/.exec(v);
  if (numericRange) {
    const lo = parseInt(numericRange[1]!, 10);
    const hi = parseInt(numericRange[2]!, 10);
    const result: BreakpointRange = {};
    if (lo > 0) result.min = `${lo}px`;
    result.max = `${hi}px`;
    return result;
  }

  // ── Named (single or space-separated multi-name) ──────────
  const names = v.split(/\s+/).filter(Boolean);

  if (names.length === 1) {
    const entry = lookup[names[0]!];
    return entry ?? null;
  }

  // Multi-name: merge into a spanning range.
  //   "laptop desktop" → min:1024px max:1919px (lowest min, highest max)
  // If any name has no upper bound, the merged result has no upper bound.
  let lowestMin: number | null = null;
  let highestMax: number | null = null;
  let openEnded = false;

  for (const name of names) {
    const entry = lookup[name];
    if (!entry) return null; // unknown name — bail

    if (entry.min !== undefined) {
      const px = parseFloat(entry.min);
      if (lowestMin === null || px < lowestMin) lowestMin = px;
    }

    if (entry.max !== undefined) {
      const px = parseFloat(entry.max);
      if (highestMax === null || px > highestMax) highestMax = px;
    } else {
      openEnded = true;
    }
  }

  const merged: BreakpointRange = {};
  if (lowestMin !== null && lowestMin > 0) merged.min = `${lowestMin}px`;
  if (!openEnded && highestMax !== null) merged.max = `${highestMax}px`;
  return merged;
}

/**
 * Builds a CSS media query string from min, max, and orientation values.
 */
function buildMediaQuery(
  min: string | undefined,
  max: string | undefined,
  orientation: string | null,
): string {
  const parts: string[] = [];
  if (min) parts.push(`(min-width: ${min})`);
  if (max) parts.push(`(max-width: ${max})`);
  const oriV = orientation?.trim();
  if (oriV && oriV !== "any") parts.push(`(orientation: ${oriV})`);
  return parts.length > 0 ? parts.join(" and ") : "all";
}

/* ── at-breakpoint element ───────────────────────────────────── */

/**
 * A conditionally rendered child of `<breakpoint-layout>`.
 *
 * Shown when its conditions (`range`, or `min`/`max`, and `orientation`)
 * are met. Hidden otherwise (display: none).
 */
export class AtBreakpointElement extends HTMLElement {
  /**
   * Named range lookup table used by the `range` attribute.
   * Override this static property before calling `define()` to
   * customize or extend the built-in ranges.
   */
  static ranges: Record<string, BreakpointRange> = { ...DEFAULT_RANGES };

  static get observedAttributes(): string[] {
    return ["min", "max", "range", "orientation"];
  }

  #mql: MediaQueryList | null = null;
  #listener: ((e: MediaQueryListEvent) => void) | null = null;

  connectedCallback(): void {
    this.#bind();
  }
  disconnectedCallback(): void {
    this.#unbind();
  }
  attributeChangedCallback(): void {
    this.#bind();
  }

  /**
   * Resolves effective min/max from `range`, `min`, and `max` attributes.
   * Explicit `min`/`max` always win over `range`.
   */
  #resolveMinMax(): { min: string | undefined; max: string | undefined } {
    const rawMin = normalizeRaw(this.getAttribute("min")) || undefined;
    const rawMax = normalizeRaw(this.getAttribute("max")) || undefined;
    const rawRange = normalizeRaw(this.getAttribute("range")) || undefined;

    if (!rawRange) return { min: rawMin, max: rawMax };

    if (rawMin !== undefined || rawMax !== undefined) {
      if (
        typeof process === "undefined" ||
        process.env?.["NODE_ENV"] !== "production"
      ) {
        console.warn(
          `<at-breakpoint>: \`range\` and \`min\`/\`max\` are mutually exclusive. ` +
            `\`min\`/\`max\` take precedence. Remove \`range="${rawRange}"\` ` +
            `or the explicit \`min\`/\`max\` attributes.`,
          this,
        );
      }
      return { min: rawMin, max: rawMax };
    }

    const parsed = parseRange(rawRange, AtBreakpointElement.ranges);
    if (parsed === null) {
      if (
        typeof process === "undefined" ||
        process.env?.["NODE_ENV"] !== "production"
      ) {
        console.warn(
          `<at-breakpoint>: unknown range value "${rawRange}". ` +
            `Valid named ranges: ${Object.keys(AtBreakpointElement.ranges).join(", ")}. ` +
            `Or use a numeric range like "480-767" or "1920+".`,
          this,
        );
      }
      return { min: undefined, max: undefined }; // fall back to always-visible
    }

    return { min: parsed.min, max: parsed.max };
  }

  #bind(): void {
    this.#unbind();

    const { min, max } = this.#resolveMinMax();
    const ori = normalizeRaw(this.getAttribute("orientation"));
    const query = buildMediaQuery(min, max, ori || null);
    const mql = window.matchMedia(query);

    this.#mql = mql;
    this.#applyMatch(mql.matches);

    const listener = (e: MediaQueryListEvent): void =>
      this.#applyMatch(e.matches);
    this.#listener = listener;

    if (mql.addEventListener) {
      mql.addEventListener("change", listener);
    } else {
      (
        mql as MediaQueryList & { addListener: (fn: unknown) => void }
      ).addListener(listener);
    }
  }

  #unbind(): void {
    if (this.#mql && this.#listener) {
      if (this.#mql.removeEventListener) {
        this.#mql.removeEventListener("change", this.#listener);
      } else {
        (
          this.#mql as MediaQueryList & {
            removeListener: (fn: unknown) => void;
          }
        ).removeListener(this.#listener);
      }
    }
    this.#mql = null;
    this.#listener = null;
  }

  #applyMatch(matches: boolean): void {
    this.style.display = matches ? "block" : "none";
  }

  /** Whether this element is currently visible. */
  get isActive(): boolean {
    return this.#mql?.matches ?? false;
  }

  /**
   * The resolved media query string currently being evaluated.
   * Useful for debugging: `el.mediaQuery` in devtools.
   */
  get mediaQuery(): string {
    return this.#mql?.media ?? "";
  }
}

/* ── breakpoint-layout element ───────────────────────────────── */

/**
 * Transparent container for at-breakpoint children.
 * `display: contents` — no box of its own.
 */
export class BreakpointLayoutElement extends HTMLElement {
  get variants(): AtBreakpointElement[] {
    return Array.from(this.querySelectorAll(":scope > at-breakpoint")).filter(
      (el): el is AtBreakpointElement => el instanceof AtBreakpointElement,
    );
  }

  get activeVariants(): AtBreakpointElement[] {
    return this.variants.filter((v) => v.isActive);
  }
}

/* ── Exports ─────────────────────────────────────────────────── */

/**
 * The built-in named range definitions.
 * Import to inspect or extend defaults.
 */
export { DEFAULT_RANGES };

/* ── Registration ─────────────────────────────────────────────── */

/**
 * Registers `<breakpoint-layout>` and `<at-breakpoint>`.
 * Safe to call multiple times.
 *
 * @example
 * import { define } from '@the-design-system/layout/breakpoint';
 * define();
 */
export function define(): void {
  defineElement("breakpoint-layout", BreakpointLayoutElement);
  defineElement("at-breakpoint", AtBreakpointElement);
}
