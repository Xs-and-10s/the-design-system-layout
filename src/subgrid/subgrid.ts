/**
 * @design-system/layout — subgrid-layout
 *
 * A transparent grid item that participates in its parent grid's track
 * definitions, aligning its own children to the parent's column (and
 * optionally row) tracks.
 *
 * Requires: must be a direct child of a grid container.
 * Browser support: Baseline 2023 — Chrome 117+, Firefox 71+, Safari 16+.
 *
 * Usage:
 *   <!-- Three cards with aligned internal sections -->
 *   <columns-layout cols="3" rows="auto 1fr auto" gap="m">
 *     <!-- Each subgrid-layout spans 1 column and 3 rows,
 *          and subgrids both axes so header/body/footer align
 *          across all three cards -->
 *     <subgrid-layout rows row-span="3">
 *       <header>Short title</header>
 *       <p>Variable length body content that might wrap to many lines.</p>
 *       <footer><button>Action</button></footer>
 *     </subgrid-layout>
 *
 *     <subgrid-layout rows row-span="3">
 *       <header>A Much Longer Title That Wraps</header>
 *       <p>Short body.</p>
 *       <footer><button>Action</button></footer>
 *     </subgrid-layout>
 *
 *     <subgrid-layout rows row-span="3">
 *       <header>Medium title here</header>
 *       <p>Body content of moderate length here.</p>
 *       <footer><button>Action</button></footer>
 *     </subgrid-layout>
 *   </columns-layout>
 *   <!-- All three headers, bodies, and footers will share the same
 *        row height — determined by the tallest content in each row. -->
 *
 *   <!-- Wide subgrid spanning 2 of 4 columns -->
 *   <columns-layout cols="4">
 *     <card>…</card>
 *     <subgrid-layout col-span="2">
 *       <section>…spans col track 1 of the 2-col subgrid…</section>
 *       <section>…spans col track 2 of the 2-col subgrid…</section>
 *     </subgrid-layout>
 *     <card>…</card>
 *   </columns-layout>
 *
 * @module @design-system/layout/subgrid
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<subgrid-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const SubgridLayoutElement = createDesignSystemLayoutElement({

    /**
     * col-span — number of parent grid columns to span.
     *
     * This element uses `grid-column: span N` where N is this value.
     * The CSS uses `grid-column: span var(--ds-subgrid-col-span, 1)`.
     *
     * Subgrid with col-span="1" is technically valid but rarely useful —
     * a single-column subgrid has only one track, which provides no
     * cross-sibling alignment benefit. Always set col-span when using
     * this element inside a multi-column grid.
     *
     * Maps to: --ds-subgrid-col-span (grid-column: span N)
     * Default: 1
     *
     * @example <subgrid-layout col-span="3">  ← spans all 3 columns
     * @example <subgrid-layout col-span="2">  ← spans 2 of N columns
     */
    'col-span': {
        type: 'number',
        var:  '--ds-subgrid-col-span',
    },

    /**
     * row-span — number of parent grid rows to span.
     *
     * When [rows] is also present, this element subgrids the row axis
     * and row-span controls how many parent row tracks are included.
     *
     * Maps to: --ds-subgrid-row-span (grid-row: span N)
     * Default: 1
     *
     * @example <subgrid-layout rows row-span="3">  ← spans 3 rows, subgrids both axes
     */
    'row-span': {
        type: 'number',
        var:  '--ds-subgrid-row-span',
    },

    /**
     * gap — gap for subgrid-layout's internal grid.
     *
     * IMPORTANT: When grid-template-columns is subgrid, the column gap
     * is inherited from the parent grid by default (CSS spec). Setting
     * `gap` here overrides that inheritance with a custom value.
     *
     * In most cases, do NOT set this — let the parent gap inherit.
     * Only set it when you need a different gap inside the subgrid
     * than the parent grid uses.
     *
     * Maps to: --ds-subgrid-gap
     */
    gap: {
        type: 'space',
        var:  '--ds-subgrid-gap',
    },

    /** gap-block — row gap override inside subgrid. */
    'gap-block': {
        type: 'space',
        var:  '--ds-subgrid-gap-block',
    },

    /** gap-inline — column gap override inside subgrid. */
    'gap-inline': {
        type: 'space',
        var:  '--ds-subgrid-gap-inline',
    },

    /** align — block-axis alignment of children. Default: stretch */
    align: {
        type: 'raw',
        var:  '--ds-subgrid-align',
    },

    /** justify — inline-axis alignment of children. Default: stretch */
    justify: {
        type: 'raw',
        var:  '--ds-subgrid-justify',
    },

    /*
        CSS-only boolean attribute:
        [rows] — also subgrid the row axis (grid-template-rows: subgrid)
    */

});

/**
 * Registers the `<subgrid-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/subgrid';
 * define();
 */
export function define(): void {
    defineElement('subgrid-layout', SubgridLayoutElement);
}
