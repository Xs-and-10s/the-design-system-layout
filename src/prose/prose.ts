/**
 * @the-design-system/layout — prose-layout
 *
 * A block wrapper that applies consistent vertical flow rhythm to arbitrary
 * mixed HTML content. Controls the breathing between headings, paragraphs,
 * lists, blockquotes, code blocks, tables, figures, and horizontal rules.
 *
 * This is the micro-layout complement to the macro-layout primitives:
 *   - region-layout / centered-layout control the spatial *container*
 *   - prose-layout governs the internal *flow rhythm* of content within it
 *
 * Print styles are always bundled in the companion CSS. They activate only
 * under @media print — zero cost during normal screen rendering. No opt-in
 * required; every prose-layout is print-ready automatically.
 *
 * All CSS rules use :where() for zero specificity. Every custom property has a
 * fallback that resolves to design system space tokens where applicable.
 *
 * Usage:
 *   <prose-layout>
 *     <h2>Title</h2>
 *     <p>Body text with <a href="#">a link</a> and <code>inline code</code>.</p>
 *     <ul><li>Item one</li><li>Item two</li></ul>
 *   </prose-layout>
 *
 *   <prose-layout compact>…tighter spacing…</prose-layout>
 *   <prose-layout measure="48ch" flow="m" flow-heading="xl">…</prose-layout>
 *
 * @module @the-design-system/layout/prose
 */

import { createDesignSystemLayoutElement, defineElement } from "../core.js";

// ── Base class via factory ────────────────────────────────────────────────────
// All var-mapped attributes are handled by the factory. The `compact` boolean
// attribute is handled in the extension class below — it drives CSS directly
// via the [compact] attribute selector, so no JS class manipulation is needed.
// The factory covers every attribute that sets a CSS custom property.

// REPLACE the _ProseBase + ProseLayoutElement class with just:

export const ProseLayoutElement = createDesignSystemLayoutElement({
  measure: { type: "raw", var: "--ds-prose-measure" },
  leading: { type: "raw", var: "--ds-prose-leading" },
  flow: { type: "space", var: "--ds-prose-flow" },
  "flow-heading": { type: "space", var: "--ds-prose-flow-heading" },
  "li-gap": { type: "space", var: "--ds-prose-li-gap" },
  "list-indent": { type: "raw", var: "--ds-prose-list-indent" },
  "rule-gap": { type: "space", var: "--ds-prose-rule-gap" },
  "pre-pad": { type: "space", var: "--ds-prose-pre-pad" },
  "pre-radius": { type: "space", var: "--ds-prose-pre-radius" },
  "heading-leading": { type: "raw", var: "--ds-prose-heading-leading" },
  "dt-weight": { type: "raw", var: "--ds-prose-dt-weight" },
});

/**
 * Registers the `<prose-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@the-design-system/layout/prose';
 * define();
 */
export function define(): void {
  defineElement("prose-layout", ProseLayoutElement);
}
