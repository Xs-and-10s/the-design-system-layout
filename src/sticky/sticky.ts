/**
 * @design-system/layout — sticky-layout
 *
 * A position: sticky wrapper. Sticks to one or more edges of its
 * nearest scrolling ancestor when the user scrolls past its natural
 * position in the document flow.
 *
 * IMPORTANT — if sticking isn't working, check these first:
 *   1. Is the CSS file loaded? (position: sticky on inline = no effect)
 *   2. Is there an overflow: hidden/auto/scroll ancestor on that axis?
 *   3. Is the containing block tall enough to scroll?
 *   4. Is at least one edge attribute set? (none set = no sticky)
 *   5. Is there a `contain: layout` ancestor?
 * See sticky.css for a detailed explanation of each failure mode.
 *
 * Basic usage:
 *   <!-- Stick to the top (most common) -->
 *   <sticky-layout bs="0">
 *     <header>…</header>
 *   </sticky-layout>
 *
 *   <!-- Stick to the bottom (e.g. a bottom action bar) -->
 *   <sticky-layout be="0">
 *     <footer>…</footer>
 *   </sticky-layout>
 *
 *   <!-- Stick to the top-right corner -->
 *   <sticky-layout bs="0" ie="0">
 *     <aside>…</aside>
 *   </sticky-layout>
 *
 *   <!-- Top-sticky with safe-area compensation (mobile notches) -->
 *   <sticky-layout bs="0" safe>
 *     <header>…</header>
 *   </sticky-layout>
 *
 *   <!-- Offset from top — e.g. below a fixed app bar 64px tall -->
 *   <sticky-layout bs="64px">…</sticky-layout>
 *
 *   <!-- Using a space token for the offset -->
 *   <sticky-layout bs="l">…</sticky-layout>
 *
 * @module @design-system/layout/sticky
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<sticky-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export const StickyLayoutElement = createDesignSystemLayoutElement({

    /* ── Edge offsets ────────────────────────────────────────
       All four logical sticky edges. At least one must be set
       for sticky to activate on that axis.

       All attributes accept:
         - Named space tokens: 0 xs s s-m m l xl xxl etc.
         - Arbitrary CSS lengths: 0, 1rem, 64px, 4svh, etc.
         - env() values: env(safe-area-inset-top) — though the
           [safe] boolean attribute does this for you automatically.

       Using space tokens for offsets is useful when you want
       the sticky gap to stay rhythmically coherent with the
       rest of the layout — e.g. bs="s" keeps a consistent
       spatial relationship with spaced siblings.
    ──────────────────────────────────────────────────────────── */

    /**
     * bs — inset-block-start offset.
     * In horizontal writing: top edge (distance from the top of
     * the scroll container at which the element sticks).
     *
     * This is the most common edge to set.
     * Maps to: --ds-sticky-bs
     * @example <sticky-layout bs="0">   ← stick flush to top
     * @example <sticky-layout bs="4rem"> ← stick 4rem from top
     * @example <sticky-layout bs="l">   ← stick 1 space-l from top
     */
    bs: {
        type: 'space',
        var:  '--ds-sticky-bs',
    },

    /**
     * be — inset-block-end offset.
     * In horizontal writing: bottom edge (distance from the bottom
     * of the scroll container at which the element sticks).
     *
     * Maps to: --ds-sticky-be
     * @example <sticky-layout be="0">  ← stick flush to bottom
     */
    be: {
        type: 'space',
        var:  '--ds-sticky-be',
    },

    /**
     * is — inset-inline-start offset.
     * In horizontal LTR writing: left edge.
     * In horizontal RTL writing: right edge.
     *
     * Maps to: --ds-sticky-is
     * @example <sticky-layout is="0">  ← stick to inline-start
     */
    is: {
        type: 'space',
        var:  '--ds-sticky-is',
    },

    /**
     * ie — inset-inline-end offset.
     * In horizontal LTR writing: right edge.
     * In horizontal RTL writing: left edge.
     *
     * Maps to: --ds-sticky-ie
     * @example <sticky-layout ie="0">  ← stick to inline-end
     */
    ie: {
        type: 'space',
        var:  '--ds-sticky-ie',
    },


    /**
     * z — z-index of the sticky element.
     *
     * Accepts a valid integer. Non-numeric values are rejected
     * and the token falls back to --ds-z-sticky (20).
     *
     * Override when the element needs to stack above or below
     * specific siblings or overlay elements in a local stacking
     * context.
     *
     * Maps to: --ds-sticky-z
     * Default: --ds-z-sticky (20 from core tokens)
     * @example <sticky-layout bs="0" z="25">
     */
    z: {
        type: 'number',
        var:  '--ds-sticky-z',
    },

    /*
        Note: the [safe] boolean attribute is not listed here because
        it requires no JS side effects — it is handled entirely by a
        CSS attribute selector rule in sticky.css.

        [safe]: adds env(safe-area-inset-*) to each active sticky edge,
        compensating for notches and home indicators on mobile devices.
    */

});

/**
 * Registers the `<sticky-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * NOTE: Always load sticky.css alongside this JS module.
 * The custom element definition alone is not sufficient —
 * position: sticky on an unrestyled (inline) element has no effect.
 * The CSS provides the display: block and position: sticky declarations
 * that make the element function.
 *
 * @example
 * import { define } from '@design-system/layout/sticky';
 * define();
 */
export function define(): void {
    defineElement('sticky-layout', StickyLayoutElement);
}
