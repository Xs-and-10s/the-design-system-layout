/**
 * @design-system/layout — bookend-layout
 *
 * A three-child horizontal grid. Places children at the inline-start,
 * middle, and inline-end of the container. The middle takes remaining
 * space (1fr) by default; the ends shrink to content width (auto).
 *
 * Usage:
 *   <!-- Centered content with equal gutters -->
 *   <bookend-layout size-is="l" size-ie="l">
 *     <div></div>             ← empty gutter
 *     <main>…content…</main>
 *     <div></div>             ← empty gutter
 *   </bookend-layout>
 *
 *   <!-- Fixed sidebar + main content -->
 *   <bookend-layout size-is="240px">
 *     <nav>…sidebar…</nav>
 *     <main>…</main>
 *     <div></div>
 *   </bookend-layout>
 *
 *   <!-- Header: logo | nav | actions -->
 *   <bookend-layout>
 *     <a href="/">Logo</a>
 *     <nav>…</nav>
 *     <clustered-layout ui>…</clustered-layout>
 *   </bookend-layout>
 *
 *   <!-- Scale token gutters (consistent with spacing system) -->
 *   <bookend-layout size-is="xl" size-ie="xl">
 *     <span></span>
 *     <article>…</article>
 *     <span></span>
 *   </bookend-layout>
 *
 * @module @design-system/layout/bookend
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<bookend-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const BookendLayoutElement = createDesignSystemLayoutElement({

    /**
     * size-is — width of the inline-start (left in LTR) column.
     *
     * Accepts:
     *   Space tokens: tiny, xxxs, xxs, xs, s, m, l, xl, xxl, xxxl, huge,
     *   or adjacent pairs like s-m → resolved to var(--ds-space-<token>)
     *   for a fixed-width gutter column in rhythm with the spacing scale.
     *
     *   CSS track sizes: auto, 1fr, 200px, 20ch, minmax(0, 25%), etc.
     *   These pass through directly as grid track values.
     *
     * Maps to: --ds-bookend-size-is
     * Default: auto (shrinks to content width)
     *
     * @example <bookend-layout size-is="l">     ← space token gutter
     * @example <bookend-layout size-is="240px"> ← fixed sidebar width
     * @example <bookend-layout size-is="1fr">   ← equal-width first column
     */
    'size-is': {
        type: 'space',
        var:  '--ds-bookend-size-is',
    },

    /**
     * size-ml — width of the middle column.
     *
     * Accepts space tokens or any CSS grid track size.
     * Use space tokens for a fixed-width centered column.
     * Use fr units (e.g. "1fr") for a flexible column.
     * Use "minmax(0, 65ch)" to combine a max-width with full flexibility.
     *
     * Maps to: --ds-bookend-size-ml
     * Default: 1fr (takes all space not claimed by size-is and size-ie)
     *
     * @example <bookend-layout size-ml="65ch">
     * @example <bookend-layout size-ml="minmax(0, 65ch)">
     * @example <bookend-layout size-ml="xl">  ← fixed width from scale
     */
    'size-ml': {
        type: 'space',
        var:  '--ds-bookend-size-ml',
    },

    /**
     * size-ie — width of the inline-end (right in LTR) column.
     *
     * Accepts space tokens or any CSS grid track size.
     * Same semantics as size-is but for the trailing column.
     *
     * Maps to: --ds-bookend-size-ie
     * Default: auto (shrinks to content width)
     *
     * @example <bookend-layout size-is="l" size-ie="l"> ← symmetric gutters
     */
    'size-ie': {
        type: 'space',
        var:  '--ds-bookend-size-ie',
    },

});

/**
 * Registers the `<bookend-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/bookend';
 * define();
 */
export function define(): void {
    defineElement('bookend-layout', BookendLayoutElement);
}
