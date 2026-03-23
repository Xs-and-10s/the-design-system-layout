/**
 * @design-system/layout — repel-layout
 *
 * A two-child flex row that pushes its children to opposite ends
 * of the inline axis using justify-content: space-between.
 *
 * The correct primitive for any "left thing | right thing" pattern:
 * logo | nav, title | close button, label | value, author | timestamp.
 *
 * Distinct from bookend-layout (three-column grid, requires 3 children),
 * split-layout (equal-width children, switches to column), and
 * clustered-layout (N homogeneous wrapping items).
 *
 * Usage:
 *   <!-- Header: logo pushed left, nav pushed right -->
 *   <repel-layout>
 *     <a href="/"><img src="logo.svg" alt="Home"></a>
 *     <nav>…</nav>
 *   </repel-layout>
 *
 *   <!-- Toolbar: title left, action right -->
 *   <repel-layout>
 *     <h2>Document title</h2>
 *     <button aria-label="Close">✕</button>
 *   </repel-layout>
 *
 *   <!-- List item: label left, value/badge right -->
 *   <repel-layout>
 *     <span>Storage used</span>
 *     <strong>4.2 GB of 15 GB</strong>
 *   </repel-layout>
 *
 *   <!-- Responsive header: stacks on narrow screens -->
 *   <repel-layout wrap>
 *     <a href="/"><img src="logo.svg" alt="Home"></a>
 *     <nav>…</nav>
 *   </repel-layout>
 *
 *   <!-- Custom gap -->
 *   <repel-layout gap="xl">
 *     <span>Left</span>
 *     <span>Right</span>
 *   </repel-layout>
 *
 *   <!-- Baseline alignment for mixed text sizes -->
 *   <repel-layout align="baseline">
 *     <h1>Large heading</h1>
 *     <p>Smaller subtext</p>
 *   </repel-layout>
 *
 *   <!-- Card header composed with other layout elements -->
 *   <quadrilateral-layout pad="m" border="1px solid var(--ds-color-border)" radius="s">
 *     <stacked-layout gap="m">
 *       <repel-layout>
 *         <h3>Card title</h3>
 *         <button aria-label="More options">…</button>
 *       </repel-layout>
 *       <p>Card content…</p>
 *     </stacked-layout>
 *   </quadrilateral-layout>
 *
 * @module @design-system/layout/repel
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<repel-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const RepelLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — minimum space between the two children.
     *
     * In nowrap mode (default): sets the floor gap between the
     * two ends. Space beyond this minimum is distributed by
     * justify-content: space-between.
     *
     * In [wrap] mode: becomes the gap between the two stacked rows
     * when children wrap to separate lines.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-repel-gap
     * Default: --ds-gap (layout gap from core tokens)
     *
     * @example <repel-layout gap="xl">
     * @example <repel-layout gap="s-m">  ← between s and m
     */
    gap: {
        type: 'space',
        var:  '--ds-repel-gap',
    },

    /**
     * align — cross-axis (vertical) alignment of both children.
     *
     * Accepts any valid align-items keyword:
     *   center   — vertically centered (default; correct for most
     *              header and toolbar use cases)
     *   start    — aligned to the top edge
     *   end      — aligned to the bottom edge
     *   stretch  — both children stretch to fill the container height
     *   baseline — aligned by first text baseline (useful for mixed
     *              text sizes in the two children)
     *
     * Maps to: --ds-repel-align (used as align-items in CSS)
     * Default: center
     *
     * @example <repel-layout align="baseline">
     * @example <repel-layout align="start">   ← top-align for multi-line children
     */
    align: {
        type: 'raw',
        var:  '--ds-repel-align',
    },

    /*
        CSS-only boolean attribute (no JS side effects):

        [wrap]
          Enables flex-wrap: wrap. When the two children can no longer
          fit side by side, they wrap to separate lines. The first child
          occupies the first line (aligned to start edge), the second
          child occupies the second line. gap controls the space between
          the two stacked rows.

          Use for headers and toolbars that should stack on narrow screens.
          Do NOT use when the two-column layout must be preserved at all
          widths (e.g. a table row label | value — use nowrap and allow
          text truncation instead).
    */

});

/**
 * Registers the `<repel-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/repel';
 * define();
 */
export function define(): void {
    defineElement('repel-layout', RepelLayoutElement);
}
