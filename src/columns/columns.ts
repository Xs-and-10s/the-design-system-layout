/**
 * @design-system/layout — columns-layout
 *
 * A CSS grid with an explicit column track definition. Column count
 * and sizes are author-controlled, not derived from content width.
 *
 * Usage:
 *   <!-- 3 equal columns (default) -->
 *   <columns-layout>
 *     <card>…</card><card>…</card><card>…</card>
 *   </columns-layout>
 *
 *   <!-- 4 equal columns, explicit -->
 *   <columns-layout cols="4">
 *     <card>…</card>…
 *   </columns-layout>
 *
 *   <!-- Asymmetric: sidebar + main -->
 *   <columns-layout cols="240px 1fr">
 *     <nav>…</nav>
 *     <main>…</main>
 *   </columns-layout>
 *
 *   <!-- Three-column: narrow | wide | narrow -->
 *   <columns-layout cols="1fr 2fr 1fr">
 *     <aside>…</aside><article>…</article><aside>…</aside>
 *   </columns-layout>
 *
 *   <!-- Named rows too -->
 *   <columns-layout cols="3" rows="auto 1fr auto">
 *     …9 children flow into 3×3 grid…
 *   </columns-layout>
 *
 *   <!-- Asymmetric row gaps -->
 *   <columns-layout cols="3" gap-block="xl" gap-inline="m">
 *     …
 *   </columns-layout>
 *
 *   <!-- Subgrid: children align to ancestor grid's columns -->
 *   <columns-layout cols="3">
 *     <columns-layout subgrid>  ← col-span must be set via pane-layout
 *       …
 *     </columns-layout>
 *   </columns-layout>
 *
 *   <!-- Spanning items with pane-layout -->
 *   <columns-layout cols="3">
 *     <pane-layout area="1 / 1 / 2 / 3">…wide item…</pane-layout>
 *     <card>…</card>
 *   </columns-layout>
 *
 * @module @design-system/layout/columns
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<columns-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const ColumnsLayoutElement = createDesignSystemLayoutElement({

    /**
     * cols — column track definition.
     *
     * Two forms:
     *   Integer: "3" → repeat(3, 1fr) — N equal-width 1fr columns
     *   Track list: "1fr 2fr 1fr" — explicit widths per column
     *
     * Any valid CSS grid track list is accepted: auto, fr, px,
     * ch, minmax(), fit-content(), repeat(), etc.
     *
     * Maps to: --ds-columns-cols (grid-template-columns)
     * Default: repeat(3, 1fr)
     *
     * @example <columns-layout cols="4">
     * @example <columns-layout cols="240px 1fr">
     * @example <columns-layout cols="repeat(auto-fit, minmax(200px, 1fr))">
     */
    cols: {
        type: 'columns',
        var:  '--ds-columns-cols',
    },

    /**
     * rows — row track definition.
     *
     * Two forms:
     *   Integer: "3" → repeat(3, auto) — N auto-height rows
     *   Track list: "auto 1fr auto" — explicit heights per row
     *
     * Maps to: --ds-columns-rows (grid-template-rows)
     * Default: auto (browser determines row heights from content)
     *
     * @example <columns-layout cols="3" rows="auto 1fr auto">
     * @example <columns-layout cols="2" rows="200px">
     */
    rows: {
        type: 'rows',
        var:  '--ds-columns-rows',
    },

    /**
     * gap — gap on both axes (row and column).
     * Overridden per-axis by gap-block or gap-inline.
     *
     * Maps to: --ds-columns-gap
     * Default: --ds-gap
     */
    gap: {
        type: 'space',
        var:  '--ds-columns-gap',
    },

    /**
     * gap-block — row gap. Overrides gap on the row (vertical) axis.
     *
     * Maps to: --ds-columns-gap-block
     */
    'gap-block': {
        type: 'space',
        var:  '--ds-columns-gap-block',
    },

    /**
     * gap-inline — column gap. Overrides gap on the inline (horizontal) axis.
     *
     * Maps to: --ds-columns-gap-inline
     */
    'gap-inline': {
        type: 'space',
        var:  '--ds-columns-gap-inline',
    },

    /**
     * align — block-axis (vertical) alignment of items within each cell.
     *   stretch (default), start, end, center, baseline
     *
     * Maps to: --ds-columns-align (align-items)
     */
    align: {
        type: 'raw',
        var:  '--ds-columns-align',
    },

    /**
     * justify — inline-axis (horizontal) alignment of items within each cell.
     *   stretch (default), start, end, center
     *
     * Maps to: --ds-columns-justify (justify-items)
     */
    justify: {
        type: 'raw',
        var:  '--ds-columns-justify',
    },

    /*
        CSS-only boolean attributes (no JS side effects):
        [dense]         — grid-auto-flow: dense (backfill gaps, breaks DOM order)
        [subgrid]       — grid-template-columns: subgrid (inherit parent tracks)
        [subgrid][rows] — also grid-template-rows: subgrid
    */

});

/**
 * Registers the `<columns-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/columns';
 * define();
 */
export function define(): void {
    defineElement('columns-layout', ColumnsLayoutElement);
}
