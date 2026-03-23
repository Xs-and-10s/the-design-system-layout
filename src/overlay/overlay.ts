/**
 * @design-system/layout — overlay-layout
 *
 * A positioning and centering frame. Covers its containing block
 * (or the viewport with [fixed]) and places content within it.
 *
 * This is a LAYOUT PRIMITIVE, not a modal component. It handles
 * structural positioning only. Accessibility behavior for modal
 * dialogs (focus trapping, aria-modal, Escape key, scroll lock,
 * return-focus) belongs in @design-system/ui.
 *
 * NOTE ON NAMING:
 * This module was originally called `sw-overlay` in Starwind and
 * proposed as `modal-layout` in this system. It has been renamed
 * `overlay-layout` because:
 *   1. It is not a modal. It is a positioning frame that a modal
 *      dialog can use as its structural shell.
 *   2. Naming it `modal-layout` implies accessibility behavior
 *      that this element does not implement.
 *   A proper `<dialog>` element with aria-modal + focus management
 *   would be built in @design-system/ui using overlay-layout as
 *   the containing structure.
 *
 * Usage:
 *   <!-- Centered spinner over a loading container -->
 *   <div style="position: relative">
 *     <content-list>…</content-list>
 *     <overlay-layout>
 *       <spinner-component>Loading…</spinner-component>
 *     </overlay-layout>
 *   </div>
 *
 *   <!-- Viewport-covering overlay shell (backdrop + dialog) -->
 *   <overlay-layout fixed stack>
 *     <div style="background: oklch(0% 0 0 / 50%)"></div>  ← backdrop
 *     <dialog open aria-modal="true">…</dialog>            ← content
 *   </overlay-layout>
 *
 *   <!-- Bottom-center toast container (fixed, inset from edges) -->
 *   <overlay-layout fixed align="end" justify="center" inset="m" z="50">
 *     <stacked-layout>
 *       <toast-item>…</toast-item>
 *       <toast-item>…</toast-item>
 *     </stacked-layout>
 *   </overlay-layout>
 *
 *   <!-- Image caption at bottom of an aspect-ratio frame -->
 *   <aspect-ratio-layout ratio="16/9">
 *     <img src="photo.jpg" alt="…">
 *     <overlay-layout align="end" justify="start" no-events>
 *       <figcaption>…caption…</figcaption>
 *     </overlay-layout>
 *   </aspect-ratio-layout>
 *
 *   <!-- Inset modal frame (doesn't touch viewport edges) -->
 *   <overlay-layout fixed inset="xl" stack>
 *     <div class="scrim"></div>
 *     <dialog open aria-modal="true">…</dialog>
 *   </overlay-layout>
 *
 *   <!-- Transparent event pass-through overlay (visual only) -->
 *   <overlay-layout no-events>
 *     <div class="vignette-gradient"></div>
 *   </overlay-layout>
 *
 * @module @design-system/layout/overlay
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<overlay-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const OverlayLayoutElement = createDesignSystemLayoutElement({

    /**
     * inset — distance from each edge of the containing block.
     *
     * Accepts any named space token or CSS inset value.
     *   "0"  — flush to all edges (default behavior)
     *   "m"  — var(--ds-space-m) inset on all sides
     *   "xl" — larger frame inset, useful for viewport overlays
     *          that shouldn't cover the full screen
     *   Any CSS inset value: "1rem", "10% 2rem", etc.
     *
     * Maps to: --ds-overlay-inset (used as inset in CSS)
     * Default: 0 (flush to all edges)
     *
     * @example <overlay-layout fixed inset="xl">  ← inset from viewport edges
     * @example <overlay-layout inset="0">          ← explicit flush (same as default)
     */
    inset: {
        type: 'space',
        var:  '--ds-overlay-inset',
    },

    /**
     * align — block-axis (vertical) placement of children within the frame.
     *
     * Accepts any valid align-items keyword:
     *   center    — vertically centered (default)
     *   start     — top of the frame
     *   end       — bottom of the frame (use for toasts, bottom sheets)
     *   stretch   — children fill the full block height of the frame
     *   baseline  — aligned to text baseline
     *
     * In [stack] mode, all children share one cell and this controls
     * their collective vertical placement within that cell.
     *
     * Maps to: --ds-overlay-align (align-items)
     * Default: center
     *
     * @example <overlay-layout fixed align="end" justify="center"> ← bottom center
     * @example <overlay-layout align="start" justify="end">        ← top right
     */
    align: {
        type: 'raw',
        var:  '--ds-overlay-align',
    },

    /**
     * justify — inline-axis (horizontal) placement of children within the frame.
     *
     * Accepts any valid justify-items keyword:
     *   center  — horizontally centered (default)
     *   start   — inline-start (left in LTR)
     *   end     — inline-end (right in LTR)
     *   stretch — children fill the full inline width of the frame
     *
     * Maps to: --ds-overlay-justify (justify-items)
     * Default: center
     *
     * @example <overlay-layout align="end" justify="center"> ← bottom-center toast
     * @example <overlay-layout align="start" justify="end">  ← top-right corner
     */
    justify: {
        type: 'raw',
        var:  '--ds-overlay-justify',
    },

    /**
     * z — z-index of the overlay element.
     *
     * Accepts a valid integer. Non-numeric values are rejected.
     *
     * Use the z-index token scale from core for semantic values:
     *   --ds-z-dropdown: 10
     *   --ds-z-sticky:   20
     *   --ds-z-overlay:  30  ← default
     *   --ds-z-modal:    40
     *   --ds-z-toast:    50
     *
     * Override when dealing with local stacking contexts where the
     * semantic token scale doesn't apply (e.g. inside a positioned
     * container with its own stacking context).
     *
     * Maps to: --ds-overlay-z
     * Default: --ds-z-overlay (30)
     *
     * @example <overlay-layout z="40">   ← modal-level stacking
     * @example <overlay-layout z="50">   ← toast-level stacking
     */
    z: {
        type: 'number',
        var:  '--ds-overlay-z',
    },

    /*
        CSS-only boolean attributes (no JS side effects):

        [fixed]
          position: fixed — covers the viewport rather than the
          nearest positioned ancestor.
          Common for: dialogs, drawers, full-screen menus, lightboxes.
          Warning: if any ancestor has a CSS transform, filter, or
          will-change: transform, fixed positioning will be relative
          to that ancestor, not the viewport.

        [stack]
          All children share one grid cell (grid-area: 1/1) and overlap.
          Use for multi-child compositions: backdrop + dialog, image +
          caption, etc. Children stack in DOM order (last = on top).

        [no-events]
          pointer-events: none on the overlay. Events pass through to
          elements below. Children still receive events by default.
          Use for visual-only overlays: vignettes, gradients, tints.
    */

});

/**
 * Registers the `<overlay-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/overlay';
 * define();
 */
export function define(): void {
    defineElement('overlay-layout', OverlayLayoutElement);
}
