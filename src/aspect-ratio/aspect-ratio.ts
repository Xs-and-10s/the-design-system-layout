/**
 * @design-system/layout — aspect-ratio-layout
 *
 * A constrained frame that enforces a fixed aspect ratio and fills
 * its primary child (image, video, iframe, canvas, or arbitrary
 * content) to cover the frame.
 *
 * This element is a viewport, not a flow container. All direct
 * children are absolutely positioned and stretch to fill the frame.
 * Multiple children overlap in z-order. Captions and other flow
 * content belong outside the element.
 *
 * Usage:
 *   <aspect-ratio-layout>
 *     <img src="hero.jpg" alt="…">
 *   </aspect-ratio-layout>
 *
 *   <aspect-ratio-layout ratio="4/3" fit="contain">
 *     <video src="clip.mp4" autoplay muted loop></video>
 *   </aspect-ratio-layout>
 *
 *   <aspect-ratio-layout ratio="1" overflow="visible">
 *     <canvas id="scene"></canvas>
 *   </aspect-ratio-layout>
 *
 *   <aspect-ratio-layout ratio="16/9">
 *     <iframe src="https://…" title="…"></iframe>
 *   </aspect-ratio-layout>
 *
 * Setting a project-wide default ratio (in your own CSS):
 *   :root { --ds-aspect-ratio-default: 4 / 3; }
 *
 * @module @design-system/layout/aspect-ratio
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<aspect-ratio-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export const AspectRatioLayoutElement = createDesignSystemLayoutElement({

    /**
     * ratio — the aspect ratio of the frame.
     *
     * Accepts CSS aspect-ratio syntax with "/" as the separator:
     *   "16/9"  "4/3"  "1"  "3/2"  "21/9"
     *
     * Note: use "/" not ":" as the separator.
     * "16/9" and "16 / 9" are both accepted and normalized to "16 / 9".
     * "1" (no slash) is valid and produces a square.
     *
     * The resolved value sets --ds-aspect-ratio, which the CSS reads as:
     *   aspect-ratio: var(--ds-aspect-ratio,
     *                     var(--ds-aspect-ratio-default, 16 / 9))
     *
     * To set a project-wide default without touching each element:
     *   :root { --ds-aspect-ratio-default: 4 / 3; }
     *
     * Maps to: --ds-aspect-ratio
     */
    ratio: {
        type: 'ratio',
        var:  '--ds-aspect-ratio',
    },

    /**
     * fit — object-fit for img, video, canvas, and picture > img children.
     *
     * Accepts any CSS object-fit keyword:
     *   cover       — scale to fill, cropping edges (default)
     *   contain     — scale to fit entirely within the frame (may letterbox)
     *   fill        — stretch to fill exactly (ignores intrinsic ratio)
     *   none        — no scaling; clipped to frame size
     *   scale-down  — smaller of none or contain
     *
     * Maps to: --ds-aspect-fit
     * Default: cover
     */
    fit: {
        type: 'raw',
        var:  '--ds-aspect-fit',
    },

    /**
     * position — object-position for the same children as fit.
     *
     * Accepts any CSS position value:
     *   "50% 50%"    — center (default)
     *   "top left"   — anchor to top-left corner
     *   "0% 100%"    — anchor to bottom-left corner
     *   "center top" — horizontally centered, vertically anchored top
     *
     * Useful for keeping a specific focal point (e.g. a face) visible
     * when using fit="cover" and the frame crops the image.
     *
     * Maps to: --ds-aspect-position
     * Default: 50% 50%
     */
    position: {
        type: 'raw',
        var:  '--ds-aspect-position',
    },

    /**
     * overflow — overflow clipping behavior of the frame.
     *
     * Accepts any CSS overflow keyword:
     *   clip    — clip painting at border box, no scroll container (default where supported)
     *   hidden  — clip with BFC, safe fallback (default where clip unsupported)
     *   visible — allow children to bleed outside the frame (e.g. decorative overflow)
     *
     * The CSS uses progressive enhancement:
     *   - browsers that support overflow: clip get clip as the default
     *   - older browsers get hidden as the default
     * Setting this attribute overrides both defaults with the given value.
     *
     * Maps to: --ds-aspect-overflow
     * Default: clip (supported browsers) / hidden (fallback)
     */
    overflow: {
        type: 'raw',
        var:  '--ds-aspect-overflow',
    },

});

/**
 * Registers the `<aspect-ratio-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/aspect-ratio';
 * define();
 */
export function define(): void {
    defineElement('aspect-ratio-layout', AspectRatioLayoutElement);
}
