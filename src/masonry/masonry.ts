/**
 * @design-system/layout — masonry-layout
 *
 * A masonry layout where variable-height items fill the shortest
 * available column, eliminating the vertical gaps of uniform-row grids.
 *
 * Uses progressive enhancement:
 *   Baseline: CSS multicol (column-width / column-count / break-inside)
 *     — items flow top-to-bottom within each column
 *     — not true masonry but a reasonable fallback with no JS required
 *   Enhancement: CSS grid masonry (where supported)
 *     — true masonry, items always fill the shortest column, in DOM order
 *
 * Usage:
 *   <!-- Auto column count from minimum width -->
 *   <masonry-layout>
 *     <figure>…</figure><figure>…</figure>…
 *   </masonry-layout>
 *
 *   <!-- Custom minimum column width -->
 *   <masonry-layout min="280px">
 *     <card>…</card><card>…</card>…
 *   </masonry-layout>
 *
 *   <!-- Space token minimum -->
 *   <masonry-layout min="xxl">
 *     <card>…</card>…
 *   </masonry-layout>
 *
 *   <!-- Explicit column count -->
 *   <masonry-layout columns="3">
 *     <figure>…</figure>…
 *   </masonry-layout>
 *
 *   <!-- Both min and columns: count is maximum in multicol, explicit in grid -->
 *   <masonry-layout min="200px" columns="4">
 *     <figure>…</figure>…
 *   </masonry-layout>
 *
 *   <!-- Custom gap -->
 *   <masonry-layout gap="xl">
 *     <figure>…</figure>…
 *   </masonry-layout>
 *
 *   <!-- Asymmetric gaps -->
 *   <masonry-layout gap-block="l" gap-inline="s">
 *     <figure>…</figure>…
 *   </masonry-layout>
 *
 * @module @design-system/layout/masonry
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<masonry-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const MasonryLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — gap between items on both axes.
     *
     * In multicol mode: sets column-gap and margin-block-end on children.
     * In CSS masonry mode: sets both row-gap and column-gap.
     * Overridden per-axis by gap-block or gap-inline.
     *
     * Maps to: --ds-masonry-gap
     * Default: --ds-gap
     *
     * @example <masonry-layout gap="xl">
     */
    gap: {
        type: 'space',
        var:  '--ds-masonry-gap',
    },

    /**
     * gap-block — row (vertical) gap between items.
     *
     * In multicol: controls the margin-block-end on children.
     * In CSS masonry: sets row-gap directly.
     * Overrides gap on the block axis.
     *
     * Maps to: --ds-masonry-gap-block
     */
    'gap-block': {
        type: 'space',
        var:  '--ds-masonry-gap-block',
    },

    /**
     * gap-inline — column (horizontal) gap between columns.
     *
     * Controls column-gap in both multicol and grid modes.
     * Overrides gap on the inline axis.
     *
     * Maps to: --ds-masonry-gap-inline
     */
    'gap-inline': {
        type: 'space',
        var:  '--ds-masonry-gap-inline',
    },

    /**
     * min — minimum column width.
     *
     * The layout creates as many columns of at least this width as
     * will fit in the container.
     *
     * In multicol: sets column-width (browser computes column count).
     * In CSS masonry: the minmax() floor in grid-template-columns.
     *
     * Accepts space tokens or any CSS length.
     *
     * Maps to: --ds-masonry-min
     * Default: 16rem (~256px)
     *
     * @example <masonry-layout min="280px">
     * @example <masonry-layout min="xxl">
     */
    min: {
        type: 'space',
        var:  '--ds-masonry-min',
    },

    /**
     * columns — explicit column count.
     *
     * In multicol: sets column-count, which acts as a maximum
     * (column-width still determines actual count within this maximum).
     * In CSS masonry: switches grid-template-columns from
     * repeat(auto-fill, ...) to repeat(N, ...).
     *
     * Accepts a positive integer.
     *
     * Maps to: --ds-masonry-columns
     * Default: auto (count derived from min width)
     *
     * @example <masonry-layout columns="3">
     * @example <masonry-layout min="200px" columns="4">
     */
    columns: {
        type: 'number',
        var:  '--ds-masonry-columns',
    },

});

/**
 * Registers the `<masonry-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/masonry';
 * define();
 */
export function define(): void {
    defineElement('masonry-layout', MasonryLayoutElement);
}
