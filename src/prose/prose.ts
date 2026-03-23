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

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

// ── Base class via factory ────────────────────────────────────────────────────
// All var-mapped attributes are handled by the factory. The `compact` boolean
// attribute is handled in the extension class below — it drives CSS directly
// via the [compact] attribute selector, so no JS class manipulation is needed.
// The factory covers every attribute that sets a CSS custom property.

const _ProseBase = createDesignSystemLayoutElement({

    /**
     * measure — max-inline-size of the prose block.
     * Accepts any CSS length or percentage (e.g. "65ch", "48rem", "100%").
     * Defaults to 65ch when not set.
     * Maps to: --ds-prose-measure
     * @example <prose-layout measure="55ch">
     */
    measure: {
        type: 'raw',
        var:  '--ds-prose-measure',
    },

    /**
     * leading — line-height on the container.
     * Accepts any CSS line-height value ("1.65", "1.5", "normal").
     * Defaults to 1.65 when not set.
     * Maps to: --ds-prose-leading
     * @example <prose-layout leading="1.5">
     */
    leading: {
        type: 'raw',
        var:  '--ds-prose-leading',
    },

    /**
     * flow — vertical spacing between adjacent direct children.
     * Accepts space tokens (s-m, m, l…) or CSS length values.
     * This is the primary rhythm token — headings get flow-heading on top.
     * Maps to: --ds-prose-flow
     * @example <prose-layout flow="m">
     */
    flow: {
        type: 'space',
        var:  '--ds-prose-flow',
    },

    /**
     * flow-heading — extra top margin before h1–h6 elements.
     * Accepts space tokens or CSS length values.
     * Overrides `flow` on the block-start side of headings only.
     * Maps to: --ds-prose-flow-heading
     * @example <prose-layout flow="m" flow-heading="xl">
     */
    'flow-heading': {
        type: 'space',
        var:  '--ds-prose-flow-heading',
    },

    /**
     * li-gap — spacing between adjacent list items (li + li).
     * Also applies to the top of nested lists (li > ul/ol).
     * On coarse-pointer (touch) devices the CSS default is larger than
     * on fine-pointer devices. This attribute overrides both.
     * Accepts space tokens or CSS length values.
     * Maps to: --ds-prose-li-gap
     * @example <prose-layout li-gap="xs">
     */
    'li-gap': {
        type: 'space',
        var:  '--ds-prose-li-gap',
    },

    /**
     * list-indent — padding-inline-start on ul and ol elements.
     * Accepts CSS length values (em units recommended so it scales with type).
     * Defaults to 1.25em when not set.
     * Maps to: --ds-prose-list-indent
     * @example <prose-layout list-indent="2em">
     */
    'list-indent': {
        type: 'raw',
        var:  '--ds-prose-list-indent',
    },

    /**
     * rule-gap — margin-block around <hr> elements.
     * Accepts space tokens or CSS length values.
     * Maps to: --ds-prose-rule-gap
     * @example <prose-layout rule-gap="xl">
     */
    'rule-gap': {
        type: 'space',
        var:  '--ds-prose-rule-gap',
    },

    /**
     * pre-pad — padding inside <pre> blocks.
     * Accepts space tokens or CSS length values.
     * Maps to: --ds-prose-pre-pad
     * @example <prose-layout pre-pad="m">
     */
    'pre-pad': {
        type: 'space',
        var:  '--ds-prose-pre-pad',
    },

    /**
     * pre-radius — border-radius on <pre> blocks.
     * Accepts space tokens or CSS length values.
     * Maps to: --ds-prose-pre-radius
     * @example <prose-layout pre-radius="xs">
     */
    'pre-radius': {
        type: 'space',
        var:  '--ds-prose-pre-radius',
    },

    /**
     * heading-leading — line-height applied to all h1–h6 elements.
     * Accepts any CSS line-height value. Defaults to 1.2.
     * Maps to: --ds-prose-heading-leading
     * @example <prose-layout heading-leading="1.1">
     */
    'heading-leading': {
        type: 'raw',
        var:  '--ds-prose-heading-leading',
    },

    /**
     * dt-weight — font-weight on <dt> elements in definition lists.
     * Accepts any CSS font-weight value. Defaults to 600.
     * Maps to: --ds-prose-dt-weight
     * @example <prose-layout dt-weight="700">
     */
    'dt-weight': {
        type: 'raw',
        var:  '--ds-prose-dt-weight',
    },

});

// ── Extended class — boolean attribute passthrough ────────────────────────────
// The factory handles all var-mapped attributes. `compact` only needs to exist
// as an HTML attribute — the CSS [compact] selector does all the work.
// No class manipulation, no style injection — pure CSS attribute selector.

/**
 * The custom element class for `<prose-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export class ProseLayoutElement extends _ProseBase {

    static override get observedAttributes(): string[] {
        // compact is a pure CSS boolean — no JS handling needed.
        // We still observe it so attributeChangedCallback fires,
        // which triggers #applyAll() via the factory's implementation.
        // This ensures any future compact-dependent var logic runs.
        return [...super.observedAttributes, 'compact'];
    }

    // No override needed for connectedCallback or attributeChangedCallback —
    // the factory implementation calls #applyAll() for us, which is sufficient.
    // compact is fully CSS-driven via :where(prose-layout[compact]) { … }.
}

/**
 * Registers the `<prose-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@the-design-system/layout/prose';
 * define();
 */
export function define(): void {
    defineElement('prose-layout', ProseLayoutElement);
}
