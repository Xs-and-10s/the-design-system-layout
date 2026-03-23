/**
 * @design-system/layout — breakout-layout
 *
 * A full-bleed child of region-layout. Breaks out of the containing
 * region's inline padding to stretch edge-to-edge.
 *
 * Works via the --ds-region-pad-inline custom property that
 * region-layout sets on itself and exposes to all descendants.
 * breakout-layout reads this inherited value and applies an equal
 * negative margin-inline to cancel the region padding.
 *
 * Without a region-layout ancestor, breakout-layout has no effect
 * (falls back to 0px bleed — safe to use anywhere).
 *
 * Usage:
 *   <!-- Full-bleed image inside a padded region -->
 *   <region-layout id="gallery" pad-inline="xl">
 *     <h2>Gallery</h2>
 *     <breakout-layout>
 *       <img src="banner.jpg" alt="…">
 *     </breakout-layout>
 *     <p>Back to the padded column</p>
 *   </region-layout>
 *
 *   <!-- Partial breakout — extends image beyond text column -->
 *   <region-layout pad-inline="xl">
 *     <breakout-layout size="m">
 *       <figure>…wider-than-column image…</figure>
 *     </breakout-layout>
 *   </region-layout>
 *
 *   <!-- Full-bleed background, text stays in column -->
 *   <region-layout pad-inline="m">
 *     <breakout-layout pad="m">
 *       <div style="background: var(--brand-bg)">
 *         <p>Text has its own padding inside the breakout</p>
 *       </div>
 *     </breakout-layout>
 *   </region-layout>
 *
 *   <!-- Breakout inside nested elements (still works — inherits) -->
 *   <region-layout pad-inline="l">
 *     <stacked-layout>
 *       <p>Normal content</p>
 *       <breakout-layout>  ← still reads pad-inline from region ancestor
 *         <img src="…">
 *       </breakout-layout>
 *     </stacked-layout>
 *   </region-layout>
 *
 * @module @design-system/layout/breakout
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<breakout-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const BreakoutLayoutElement = createDesignSystemLayoutElement({

    /**
     * size — amount of breakout on each side.
     *
     * When absent, the element breaks out by the full region padding
     * (--ds-region-pad-inline inherited from the nearest region-layout).
     *
     * When set, the element breaks out by this amount instead — allowing
     * partial breakout where the element extends beyond the text column
     * by a controlled amount, but not necessarily edge-to-edge.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-breakout-size
     * Default: --ds-region-pad-inline (full bleed)
     *
     * @example <breakout-layout size="m">   ← partial: extends by space-m each side
     * @example <breakout-layout size="2rem">
     */
    size: {
        type: 'space',
        var:  '--ds-breakout-size',
    },

    /**
     * pad — inline padding to apply inside the breakout element.
     *
     * By default, breakout-layout has no padding — content fills
     * edge-to-edge. This is correct for images, videos, and banners.
     *
     * When breakout contains text that needs breathing room, set pad
     * to re-apply inline padding inside the breakout box.
     *
     * Setting pad to the same value as the parent region's pad-inline
     * exactly restores the original text column position inside the
     * breakout — creating a "full-bleed background, in-column text"
     * effect without extra wrappers.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-breakout-pad (used as padding-inline in CSS)
     * Default: 0px (no padding)
     *
     * @example
     * <!-- Background is full-bleed; text is in column -->
     * <region-layout pad-inline="l">
     *   <breakout-layout pad="l">
     *     <div style="background: var(--brand-surface)">
     *       <p>Text back in the l-padded column</p>
     *     </div>
     *   </breakout-layout>
     * </region-layout>
     */
    pad: {
        type: 'space',
        var:  '--ds-breakout-pad',
    },

});

/**
 * Registers the `<breakout-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/breakout';
 * define();
 */
export function define(): void {
    defineElement('breakout-layout', BreakoutLayoutElement);
}
