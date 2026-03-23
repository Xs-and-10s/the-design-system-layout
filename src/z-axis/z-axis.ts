/**
 * @design-system/layout — z-axis-layout
 *
 * An in-flow grid container where all children occupy the same cell,
 * overlapping in z-order. The container sizes to the tallest child.
 *
 * IN-FLOW vs POSITIONED STACKING:
 *
 * z-axis-layout (this element):
 *   IN FLOW — takes space, displaces surrounding content.
 *   Use for: image + caption, avatar + badge, card + state overlay,
 *            hero section with layered text and visuals.
 *
 * overlay-layout[stack]:
 *   POSITIONED — floats above content, takes no space.
 *   Use for: dialogs, drawers, spinners covering a region.
 *
 * Z-INDEX BEHAVIOR:
 * The `z` attribute sets z-index on this element. It only takes effect
 * when this element is a flex or grid item. In normal block flow,
 * z-index on non-positioned elements is ignored by CSS.
 *
 * [isolate] (isolation: isolate) is almost always more useful — it
 * scopes children's z-index values to this element without requiring
 * flex/grid item status.
 *
 * Usage:
 *   <!-- Image with text overlay -->
 *   <z-axis-layout>
 *     <img src="hero.jpg" alt="Mountain landscape">
 *     <stacked-layout>
 *       <h1>Summit Trail</h1>
 *       <p>12km · Moderate</p>
 *     </stacked-layout>
 *   </z-axis-layout>
 *
 *   <!-- Avatar with notification badge at top-right -->
 *   <z-axis-layout style="inline-size: fit-content">
 *     <img src="avatar.jpg" alt="User" style="block-size: 48px">
 *     <span style="align-self: start; justify-self: end">3</span>
 *   </z-axis-layout>
 *
 *   <!-- Scoped stacking context: children's z-index won't escape -->
 *   <z-axis-layout isolate>
 *     <img src="card-bg.jpg" alt="">
 *     <div style="z-index: 999">This won't stack above page header</div>
 *   </z-axis-layout>
 *
 *   <!-- Inside a grid: z places this above its sibling cells -->
 *   <columns-layout cols="3">
 *     <card>…</card>
 *     <z-axis-layout z="raised" isolate>   ← above adjacent cells
 *       <img src="featured.jpg" alt="">
 *       <badge style="z-index: 1">Featured</badge>
 *     </z-axis-layout>
 *     <card>…</card>
 *   </columns-layout>
 *
 *   <!-- Semantic z token: places this at overlay level -->
 *   <z-axis-layout z="overlay">…</z-axis-layout>
 *
 * @module @design-system/layout/z-axis
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<z-axis-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const ZAxisLayoutElement = createDesignSystemLayoutElement({

    /**
     * align — block-axis (vertical) placement of children in the
     * shared grid cell.
     *
     *   center  — vertically centered (default)
     *   start   — top of the cell
     *   end     — bottom of the cell
     *   stretch — all children stretch to the tallest child's height
     *
     * Individual children can override via align-self in their own style.
     *
     * Maps to: --ds-z-axis-align (align-items)
     * Default: center
     */
    align: {
        type: 'raw',
        var:  '--ds-z-axis-align',
    },

    /**
     * justify — inline-axis (horizontal) placement of children in the
     * shared grid cell.
     *
     *   center  — horizontally centered (default)
     *   start   — inline-start edge
     *   end     — inline-end edge
     *   stretch — all children fill the full cell width
     *
     * Individual children can override via justify-self in their own style.
     *
     * Maps to: --ds-z-axis-justify (justify-items)
     * Default: center
     */
    justify: {
        type: 'raw',
        var:  '--ds-z-axis-justify',
    },

    /**
     * z — z-index of this element relative to its siblings.
     *
     * Accepts semantic token names from the z-index scale:
     *   base, raised, dropdown, sticky, overlay, modal, toast
     * Or any integer:
     *   0, 1, 10, 25, -1, etc.
     *
     * IMPORTANT LIMITATION:
     * This only takes effect when z-axis-layout is a flex or grid item
     * (a direct child of display: flex or display: grid). In normal
     * block flow, CSS z-index on non-positioned elements has no effect
     * and this attribute is silently inert.
     *
     * The most common use case: placing one z-axis-layout above another
     * element in the same flex/grid container, e.g. a featured card that
     * should visually overlap its siblings when hovered.
     *
     * For isolating CHILDREN's z-index values, use [isolate] instead —
     * it works in all contexts, not just flex/grid item contexts.
     *
     * Maps to: --ds-z-axis-z (z-index in CSS)
     * Default: auto (normal stacking behavior)
     *
     * @example <z-axis-layout z="raised">          ← var(--ds-z-raised) = 1
     * @example <z-axis-layout z="overlay">         ← var(--ds-z-overlay) = 30
     * @example <z-axis-layout z="5">               ← concrete integer
     * @example <z-axis-layout z="overlay" isolate> ← z + scoped children
     */
    z: {
        type: 'z-index',
        var:  '--ds-z-axis-z',
    },

    /*
        CSS-only boolean attribute (no JS side effects):

        [isolate]
          isolation: isolate — creates a new stacking context for this
          element's subtree. Children's z-index values are scoped to
          this element and will not stack against external content.

          Works in ALL contexts — does not require flex/grid item status.
          No rendering side effects (unlike opacity or transform).

          Recommended whenever children use z-index explicitly, especially
          when this element is used in a shared layout context where
          children's z-values could otherwise affect siblings or ancestors.

          Combine with z for the complete stacking story:
            z="raised" — places this element above its flex/grid siblings
            [isolate]  — scopes its children's z-index within itself
    */

});

/**
 * Registers the `<z-axis-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/z-axis';
 * define();
 */
export function define(): void {
    defineElement('z-axis-layout', ZAxisLayoutElement);
}
