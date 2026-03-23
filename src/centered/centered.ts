/**
 * @design-system/layout — centered-layout
 *
 * An intrinsic centering container. Constrains content to a maximum
 * inline width and centers it with margin-inline: auto.
 *
 * Primary use: keeping prose at a comfortable reading line length
 * (the `--ds-measure` token, default 65ch) while centered in wider
 * viewports.
 *
 * Usage:
 *   <!-- Default: max 65ch, no gutter -->
 *   <centered-layout>
 *     <article>…</article>
 *   </centered-layout>
 *
 *   <!-- Custom max width -->
 *   <centered-layout max="80ch">
 *     <div class="wide-content">…</div>
 *   </centered-layout>
 *
 *   <!-- With gutter for standalone use (not inside region-layout) -->
 *   <centered-layout max="65ch" gutter="m">
 *     <p>Text with breathing room from viewport edges</p>
 *   </centered-layout>
 *
 *   <!-- Space token for max -->
 *   <centered-layout max="xl">
 *     …
 *   </centered-layout>
 *
 *   <!-- Inside region-layout: usually no gutter needed (region provides it) -->
 *   <region-layout pad-inline="m">
 *     <centered-layout max="65ch">…</centered-layout>
 *   </region-layout>
 *
 * @module @design-system/layout/centered
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<centered-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const CenteredLayoutElement = createDesignSystemLayoutElement({

    /**
     * max — maximum inline width of the content column.
     *
     * Accepts any named space token (xl, xxl, etc.) or any CSS length
     * (65ch, 80ch, 960px, 60rem, etc.).
     *
     * The element uses box-sizing: content-box, so this is the
     * CONTENT width — gutter padding is added on top. See centered.css
     * for detailed reasoning.
     *
     * Maps to: --ds-centered-max (used in max-inline-size)
     * Default: --ds-measure (65ch, comfortable prose line length)
     *
     * @example <centered-layout max="80ch">
     * @example <centered-layout max="xl">  ← space token for consistent scale
     */
    max: {
        type: 'space',
        var:  '--ds-centered-max',
    },

    /**
     * gutter — inline padding for minimum breathing room at viewport edges.
     *
     * When the viewport is narrower than `max`, the centered element
     * naturally shrinks to fit. Without a gutter, content can touch
     * the viewport edges on very small screens.
     *
     * Set gutter when centered-layout is used standalone (not inside
     * a region-layout or other container that already provides inline
     * padding). When inside a region-layout, the region's own padding
     * provides the gutter — omit this attribute or set it to 0.
     *
     * Maps to: --ds-centered-gutter (used in padding-inline)
     * Default: 0px
     *
     * @example <centered-layout gutter="s-m">  ← token: between s and m
     * @example <centered-layout gutter="1rem">
     */
    gutter: {
        type: 'space',
        var:  '--ds-centered-gutter',
    },

});

/**
 * Registers the `<centered-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/centered';
 * define();
 */
export function define(): void {
    defineElement('centered-layout', CenteredLayoutElement);
}
