/**
 * @design-system/layout — stacked-layout
 *
 * A vertical flex stack. Children are laid out in a column with a
 * consistent gap. The [deep] boolean attribute switches to block
 * layout with owl-selector rhythm for arbitrary HTML subtrees.
 *
 * Usage:
 *   <stacked-layout>
 *     <div>…</div>
 *     <div>…</div>
 *   </stacked-layout>
 *
 *   <stacked-layout gap="xl">…</stacked-layout>
 *   <stacked-layout gap="2rem">…</stacked-layout>
 *   <stacked-layout align="center">…</stacked-layout>
 *   <stacked-layout deep>…</stacked-layout>
 *
 * @module @design-system/layout/stacked
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<stacked-layout>`.
 * Exported for advanced use (e.g. subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export const StackedLayoutElement = createDesignSystemLayoutElement({
    /**
     * gap — vertical spacing between children.
     *
     * Accepts any named space token from the design system scale:
     *   tiny, xxxs, xxs, xs, s, m, l, xl, xxl, xxxl, huge
     *   or any adjacent half-step pair: s-m, m-l, xl-xxl, etc.
     * Also accepts any arbitrary CSS length value: 2rem, 8px, etc.
     *
     * Maps to: --ds-stacked-gap
     * Fallback: --ds-gap → 1rem
     */
    gap: {
        type: 'space',
        var:  '--ds-stacked-gap',
    },

    /**
     * align — cross-axis alignment of children.
     *
     * Accepts any valid CSS align-items keyword:
     *   stretch (default), start, end, center, baseline
     *
     * Maps to: --ds-stacked-align (applied via align-items in CSS)
     */
    align: {
        type: 'raw',
        var:  '--ds-stacked-align',
    },

    /*
        Note: the [deep] boolean attribute is not listed here because
        it requires no JS side effects — it is handled entirely by
        CSS attribute selectors in stacked.css.

        Include an attribute in this map only if you need JS to do
        something when the attribute is set or changed. Pure CSS
        attributes (boolean flags, display mode switches) live in
        the stylesheet alone.
    */
});

/**
 * Registers the `<stacked-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * Call this once at app startup, or import register-all.js to
 * register all layout elements at once.
 *
 * @example
 * import { define } from '@design-system/layout/stacked';
 * define();
 */
export function define(): void {
    defineElement('stacked-layout', StackedLayoutElement);
}
