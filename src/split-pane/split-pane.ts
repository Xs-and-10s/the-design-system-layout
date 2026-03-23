/**
 * @design-system/layout — split-pane-layout + pane-layout
 *
 * A named-area grid whose topology is defined by a `panes` attribute
 * string, analogous to CSS `grid-template-areas`. Track sizes are
 * set by `cols` and `rows` attributes; each child declares its area
 * via `pane-layout area="X"`.
 *
 * This module defines and registers two custom elements:
 *   <split-pane-layout> — the grid container
 *   <pane-layout>       — a direct child declaring its grid area
 *
 * Usage:
 *   <!-- Classic 3×3 named-area layout -->
 *   <split-pane-layout
 *     panes="header header header / sidebar main main / footer footer footer"
 *     cols="200px 1fr 1fr"
 *     rows="auto 1fr auto"
 *     gap="m"
 *     style="min-block-size: 100dvh"
 *   >
 *     <pane-layout area="header"><header>…</header></pane-layout>
 *     <pane-layout area="sidebar"><nav>…</nav></pane-layout>
 *     <pane-layout area="main"><main>…</main></pane-layout>
 *     <pane-layout area="footer"><footer>…</footer></pane-layout>
 *   </split-pane-layout>
 *
 *   <!-- Two-column layout: left | right -->
 *   <split-pane-layout panes="L R" cols="1fr 2fr">
 *     <pane-layout area="L">…</pane-layout>
 *     <pane-layout area="R">…</pane-layout>
 *   </split-pane-layout>
 *
 *   <!-- pane-layout with line-based placement (no panes string needed) -->
 *   <columns-layout cols="3">
 *     <pane-layout area="1 / 1 / 2 / 3">…wide item spans 2 cols…</pane-layout>
 *     <card>…auto placed…</card>
 *   </columns-layout>
 *
 *   <!-- Default equal tracks (no cols/rows needed for simple cases) -->
 *   <split-pane-layout panes="A B / C D">
 *     <pane-layout area="A">…</pane-layout>
 *     <pane-layout area="B">…</pane-layout>
 *     <pane-layout area="C">…</pane-layout>
 *     <pane-layout area="D">…</pane-layout>
 *   </split-pane-layout>
 *
 * PANES STRING FORMAT:
 *   Rows separated by "/" — each row is a space-separated list of
 *   area names. All rows must have the same number of cells.
 *   Area names must be valid CSS custom-ident (no spaces, no "none").
 *   Adjacent cells with the same name form a merged area (like
 *   grid-template-areas). Merged areas must be rectangular.
 *
 *   panes="A A B / C D B"  → A spans columns 1-2 of row 1,
 *                             B spans rows 1-2 of column 3,
 *                             C spans column 1 of row 2,
 *                             D spans column 2 of row 2
 *
 * @module @design-system/layout/split-pane
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
    normalizeSpaceLike,
    normalizeColumnTrack,
    normalizeRowTrack,
    applyVar,
} from '../core.js';


/* ── Panes string parser ──────────────────────────────────────────────── */

interface ParsedPanes {
    /** 2D array of area names, [row][col] */
    areas:    string[][];
    rowCount: number;
    colCount: number;
    /** CSS grid-template-areas value: `"A A B" "C D B"` */
    areasCSS: string;
}

/**
 * Parses a panes string into a structured representation.
 *
 * Supports two row-separator formats:
 *   "/" : panes="A A B / C D B / C E E"  (inline, unambiguous)
 *   "\n": panes="A A B\n        C D B"   (multiline HTML attribute)
 *
 * Returns null and logs a warning if the string is empty, malformed,
 * or has inconsistent column counts across rows.
 */
function parsePanes(raw: string): ParsedPanes | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    // Determine row separator: prefer "/" if present, else newlines
    const rowStrings = trimmed.includes('/')
        ? trimmed.split('/')
        : trimmed.split('\n');

    const areas = rowStrings
        .map(row => row.trim().split(/\s+/).filter(Boolean))
        .filter(row => row.length > 0);

    if (areas.length === 0) return null;

    const colCount = areas[0]!.length;

    // Validate: all rows must have the same column count
    const isValid = areas.every(row => row.length === colCount);
    if (!isValid) {
        console.warn(
            '<split-pane-layout>: all rows in the panes attribute must have ' +
            'the same number of area names. Found inconsistent column counts.',
            { raw, areas }
        );
        return null;
    }

    // Build the CSS grid-template-areas value
    // Each row becomes a quoted string: "A A B"
    const areasCSS = areas.map(row => `"${row.join(' ')}"`).join(' ');

    return {
        areas,
        rowCount: areas.length,
        colCount,
        areasCSS,
    };
}


/* ── split-pane-layout custom element ────────────────────────────────── */

/**
 * Custom element for `<split-pane-layout>`.
 *
 * A full custom element class (not factory-generated) because it needs
 * to parse the `panes` attribute and set `grid-template-areas`,
 * `grid-template-columns`, and `grid-template-rows` as computed inline
 * styles — not simply mapping an attribute value to a CSS custom property.
 *
 * Exported for advanced use. Most consumers should use `define()`.
 */
export class SplitPaneLayoutElement extends HTMLElement {

    static get observedAttributes(): string[] {
        return ['panes', 'cols', 'rows', 'gap', 'gap-block', 'gap-inline'];
    }

    connectedCallback(): void {
        this.#apply();
    }

    attributeChangedCallback(): void {
        this.#apply();
    }

    #apply(): void {
        const panesRaw = this.getAttribute('panes') ?? '';
        const parsed   = parsePanes(panesRaw);

        if (!parsed) {
            // Malformed or empty panes — remove grid properties so the
            // element renders as a normal block grid without areas.
            this.style.removeProperty('grid-template-areas');
            this.style.removeProperty('grid-template-columns');
            this.style.removeProperty('grid-template-rows');
            this.#applyGap();
            return;
        }

        const { rowCount, colCount, areasCSS } = parsed;

        // grid-template-areas: "A A B" "C D B" "C E E"
        this.style.setProperty('grid-template-areas', areasCSS);

        // grid-template-columns: from cols attr, or equal 1fr tracks
        const colsRaw = this.getAttribute('cols') ?? '';
        const cols = colsRaw
            ? normalizeColumnTrack(colsRaw)
            : `repeat(${colCount}, 1fr)`;
        this.style.setProperty('grid-template-columns', cols);

        // grid-template-rows: from rows attr, or equal auto tracks
        const rowsRaw = this.getAttribute('rows') ?? '';
        const rws = rowsRaw
            ? normalizeRowTrack(rowsRaw)
            : `repeat(${rowCount}, auto)`;
        this.style.setProperty('grid-template-rows', rws);

        this.#applyGap();
    }

    #applyGap(): void {
        applyVar(this, '--ds-split-pane-gap',
            normalizeSpaceLike(this.getAttribute('gap')));
        applyVar(this, '--ds-split-pane-gap-block',
            normalizeSpaceLike(this.getAttribute('gap-block')));
        applyVar(this, '--ds-split-pane-gap-inline',
            normalizeSpaceLike(this.getAttribute('gap-inline')));
    }
}


/* ── pane-layout custom element ────────────────────────────────────────
   A grid item that declares its placement via the `area` attribute.

   Compatible with any grid container (split-pane-layout, columns-layout,
   rows-layout, or a CSS grid defined with a class or inline style).

   The `area` attribute accepts any valid CSS grid-area value:
     Named area:    area="main"        → grid-area: main
     Line-based:    area="1 / 1 / 3 / 3" → grid-area: 1 / 1 / 3 / 3
     Mixed:         area="header"      → grid-area: header
──────────────────────────────────────────────────────────────────────── */

/**
 * The custom element class for `<pane-layout>`.
 * Exported for advanced use.
 */
export const PaneLayoutElement = createDesignSystemLayoutElement({

    /**
     * area — grid-area placement value.
     *
     * Accepts any valid CSS grid-area value:
     *   Named area:    "main", "sidebar", "A", "B"
     *   Line-based:    "1 / 1 / 3 / 3" (row-start / col-start / row-end / col-end)
     *
     * In split-pane-layout: use the same name as defined in the panes string.
     * In any other grid: use named areas or line numbers.
     *
     * Maps to: --ds-pane-area (read by grid-area: var(--ds-pane-area) in CSS)
     *
     * @example <pane-layout area="main">
     * @example <pane-layout area="header">
     * @example <pane-layout area="1 / 2 / 3 / 4">
     */
    area: {
        type: 'raw',
        var:  '--ds-pane-area',
    },

});


/* ── Registration ───────────────────────────────────────────────────── */

/**
 * Registers both `<split-pane-layout>` and `<pane-layout>` custom elements.
 * Safe to call multiple times — skips registration if already defined.
 *
 * Both elements are registered together because pane-layout is designed
 * to be used exclusively inside split-pane-layout and other grid containers.
 *
 * @example
 * import { define } from '@design-system/layout/split-pane';
 * define();
 */
export function define(): void {
    defineElement('split-pane-layout', SplitPaneLayoutElement);
    defineElement('pane-layout',       PaneLayoutElement);
}
