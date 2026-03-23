/**
 * @design-system/layout — rows-layout
 *
 * A CSS grid with an explicit row track definition. The transposition
 * of columns-layout — row height is the primary axis of control.
 *
 * Usage:
 *   <!-- 3 auto-height rows, full-width (default) -->
 *   <rows-layout>
 *     <header>…</header>
 *     <main>…</main>
 *     <footer>…</footer>
 *   </rows-layout>
 *
 *   <!-- Fixed-height header + flexible main + fixed footer -->
 *   <!-- (like sandwich-layout but for bounded containers) -->
 *   <rows-layout rows="64px 1fr 48px" style="block-size: 100%">
 *     <header>…</header>
 *     <main>…</main>
 *     <footer>…</footer>
 *   </rows-layout>
 *
 *   <!-- Two-column, three-row grid -->
 *   <rows-layout rows="auto auto auto" cols="1fr 2fr">
 *     …6 children fill 3×2 grid…
 *   </rows-layout>
 *
 *   <!-- Timeline: each row = 1 hour -->
 *   <rows-layout rows="repeat(24, 4rem)" cols="auto 1fr">
 *     …
 *   </rows-layout>
 *
 * @module @design-system/layout/rows
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<rows-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const RowsLayoutElement = createDesignSystemLayoutElement({

    /**
     * rows — row track definition.
     *
     * Two forms:
     *   Integer: "4" → repeat(4, auto) — N auto-height rows
     *   Track list: "64px 1fr 48px" — explicit heights per row
     *
     * Maps to: --ds-rows-rows (grid-template-rows)
     * Default: repeat(3, auto)
     *
     * @example <rows-layout rows="64px 1fr 48px">
     * @example <rows-layout rows="4">
     */
    rows: {
        type: 'rows',
        var:  '--ds-rows-rows',
    },

    /**
     * cols — column track definition.
     *
     * Two forms:
     *   Integer: "2" → repeat(2, 1fr) — N equal-width columns
     *   Track list: "auto 1fr" — explicit widths
     *
     * Maps to: --ds-rows-cols (grid-template-columns)
     * Default: 1fr (single full-width column)
     *
     * @example <rows-layout rows="3" cols="2">
     */
    cols: {
        type: 'columns',
        var:  '--ds-rows-cols',
    },

    /** gap — gap on both axes. Default: --ds-gap */
    gap: { type: 'space', var: '--ds-rows-gap' },

    /** gap-block — row gap. Overrides gap on the row axis. */
    'gap-block': { type: 'space', var: '--ds-rows-gap-block' },

    /** gap-inline — column gap. Overrides gap on the column axis. */
    'gap-inline': { type: 'space', var: '--ds-rows-gap-inline' },

    /** align — block-axis alignment of items. Default: stretch */
    align: { type: 'raw', var: '--ds-rows-align' },

    /** justify — inline-axis alignment of items. Default: stretch */
    justify: { type: 'raw', var: '--ds-rows-justify' },

    /*
        CSS-only boolean attributes:
        [dense]       — grid-auto-flow: column dense
        [subgrid]     — grid-template-rows: subgrid
        [subgrid][cols] — also grid-template-columns: subgrid
    */

});

/**
 * Registers the `<rows-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/rows';
 * define();
 */
export function define(): void {
    defineElement('rows-layout', RowsLayoutElement);
}
