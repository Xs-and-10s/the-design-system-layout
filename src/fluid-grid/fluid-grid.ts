/**
 * @design-system/layout — fluid-grid-layout
 *
 * A CSS grid whose column count is derived from a minimum column width —
 * no media queries, no explicit breakpoints. The browser creates as many
 * columns as fit at the minimum width, and stretches them equally to fill
 * the row.
 *
 * The original `sw-fluid-grid` had no custom element definition — it was
 * a plain CSS class. This module upgrades it to a proper custom element
 * with full attribute-to-token bridging.
 *
 * Usage:
 *   <!-- Default: 16rem minimum columns, auto-fit, layout gap -->
 *   <fluid-grid-layout>
 *     <card>…</card><card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Custom minimum column width -->
 *   <fluid-grid-layout min="280px">
 *     <card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Space token minimum -->
 *   <fluid-grid-layout min="xxl">
 *     <card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- auto-fill: items don't stretch to fill sparse rows -->
 *   <fluid-grid-layout fill min="280px">
 *     <card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Explicit column count with minimum width floor -->
 *   <fluid-grid-layout columns="3" min="200px">
 *     <card>…</card><card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Cap column max width (stops growth beyond 320px) -->
 *   <fluid-grid-layout min="200px" max="320px" fill>
 *     <card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Custom row/column gaps -->
 *   <fluid-grid-layout gap-block="xl" gap-inline="m">
 *     <card>…</card><card>…</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Aligned items -->
 *   <fluid-grid-layout align="start">
 *     <card style="block-size: 200px">tall</card>
 *     <card>short</card>
 *   </fluid-grid-layout>
 *
 *   <!-- Dense backfill for variable-size items (photo gallery) -->
 *   <fluid-grid-layout dense min="180px">
 *     <figure style="grid-row: span 2">…</figure>
 *     <figure>…</figure>
 *   </fluid-grid-layout>
 *
 * @module @design-system/layout/fluid-grid
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<fluid-grid-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const FluidGridLayoutElement = createDesignSystemLayoutElement({

    /**
     * min — minimum column width.
     *
     * The grid creates as many columns of AT LEAST this width as
     * will fit in the container. Fewer items than the column count
     * results in either stretching (auto-fit, default) or empty
     * phantom columns (auto-fill, [fill] attribute).
     *
     * Accepts any named space token or CSS length.
     * A nested min(100%, <min>) in the CSS prevents single-column
     * overflow when the container is narrower than the minimum.
     *
     * Maps to: --ds-fluid-grid-min
     * Default: 16rem (~256px)
     *
     * @example <fluid-grid-layout min="280px">
     * @example <fluid-grid-layout min="xxl">    ← space token
     * @example <fluid-grid-layout min="20rem">
     */
    min: {
        type: 'space',
        var:  '--ds-fluid-grid-min',
    },

    /**
     * max — maximum column width.
     *
     * How wide a column may grow beyond the minimum. Controls the
     * upper bound of the minmax() track definition.
     *
     * Accepts space tokens, CSS lengths, or fr units.
     *   "1fr"   — columns grow equally to fill remaining space (default)
     *   "320px" — columns never grow beyond 320px (prevents extreme
     *              stretching on very wide containers with few items)
     *   "xl"    — space token maximum (fixed width from the scale)
     *
     * Note: using a fixed max with auto-fit means columns fill from
     * the left — combine with [fill] and justify-content on a wrapper
     * if you want left-aligned fixed-width cards.
     *
     * Maps to: --ds-fluid-grid-max
     * Default: 1fr (unlimited growth)
     *
     * @example <fluid-grid-layout min="200px" max="320px" fill>
     * @example <fluid-grid-layout min="200px" max="xl">
     */
    max: {
        type: 'space',
        var:  '--ds-fluid-grid-max',
    },

    /**
     * gap — gap on both axes (row and column).
     *
     * Provides a unified gap for both row-gap and column-gap.
     * Overridden per-axis by gap-block or gap-inline.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-fluid-grid-gap
     * Default: --ds-gap (layout gap from core tokens)
     *
     * @example <fluid-grid-layout gap="xl">
     */
    gap: {
        type: 'space',
        var:  '--ds-fluid-grid-gap',
    },

    /**
     * gap-block — row gap (block axis).
     *
     * Overrides the gap attribute on the row axis only.
     * Use when vertical spacing between rows should differ from
     * the horizontal spacing between columns.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-fluid-grid-gap-block (used as row-gap in CSS)
     * Default: falls back to gap, then --ds-gap
     *
     * @example <fluid-grid-layout gap-block="xl" gap-inline="m">
     */
    'gap-block': {
        type: 'space',
        var:  '--ds-fluid-grid-gap-block',
    },

    /**
     * gap-inline — column gap (inline axis).
     *
     * Overrides the gap attribute on the column axis only.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-fluid-grid-gap-inline (used as column-gap in CSS)
     * Default: falls back to gap, then --ds-gap
     *
     * @example <fluid-grid-layout gap-block="l" gap-inline="s-m">
     */
    'gap-inline': {
        type: 'space',
        var:  '--ds-fluid-grid-gap-inline',
    },

    /**
     * columns — explicit column count.
     *
     * When set, switches from repeat(auto-fit/auto-fill) to
     * repeat(N, minmax(min(100%, min), max)).
     *
     * The min attribute still applies as the minmax lower bound,
     * preventing columns from collapsing too narrow when the container
     * is smaller than N × min.
     *
     * The [fill] attribute has no effect when columns is set (the
     * explicit count supersedes auto-fit and auto-fill).
     *
     * Accepts a positive integer.
     *
     * Maps to: --ds-fluid-grid-columns
     * Default: not set (auto column count from min width)
     *
     * @example <fluid-grid-layout columns="3">
     * @example <fluid-grid-layout columns="2" min="240px">
     */
    columns: {
        type: 'number',
        var:  '--ds-fluid-grid-columns',
    },

    /**
     * align — vertical alignment of items within each row.
     *
     * Accepts any valid CSS align-items keyword:
     *   stretch    — items fill the full row height (default)
     *   start      — items align to the top of their row
     *   end        — items align to the bottom
     *   center     — items are vertically centered
     *   baseline   — items align by their first text baseline
     *
     * Maps to: --ds-fluid-grid-align (used as align-items in CSS)
     * Default: stretch
     *
     * @example <fluid-grid-layout align="start">  ← cards align to top
     */
    align: {
        type: 'raw',
        var:  '--ds-fluid-grid-align',
    },

    /**
     * justify — horizontal alignment of items within each column.
     *
     * Accepts any valid CSS justify-items keyword:
     *   stretch    — items fill the full column width (default)
     *   start      — items align to the inline-start of their column
     *   end        — items align to the inline-end
     *   center     — items are horizontally centered in their column
     *
     * Maps to: --ds-fluid-grid-justify (used as justify-items in CSS)
     * Default: stretch
     *
     * @example <fluid-grid-layout justify="center">
     */
    justify: {
        type: 'raw',
        var:  '--ds-fluid-grid-justify',
    },

    /*
        CSS-only boolean attributes (no JS side effects needed):

        [fill]
          Switches repeat mode from auto-fit to auto-fill.
          Items do not grow to fill sparse rows — they keep their
          computed column width and leave empty space at the end.
          No effect when the columns attribute is set.

        [dense]
          Sets grid-auto-flow: dense.
          The grid backfills gaps from variable-size items with later
          items, reducing holes at the cost of visual order.
          Do not use when DOM order is meaningful for accessibility.
    */

});

/**
 * Registers the `<fluid-grid-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/fluid-grid';
 * define();
 */
export function define(): void {
    defineElement('fluid-grid-layout', FluidGridLayoutElement);
}
