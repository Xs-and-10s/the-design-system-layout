/**
 * @design-system/layout — breakin-layout
 *
 * A containment primitive. Constrains content to a maximum inline
 * width and centers it. The complement of breakout-layout.
 *
 * Where breakout-layout widens beyond the region column,
 * breakin-layout narrows within whatever space is available.
 *
 * Usage:
 *   <!-- Narrow text column inside a zero-padding region -->
 *   <region-layout pad-inline="0">
 *     <breakin-layout max="65ch" gutter="m">
 *       <h2>Heading</h2>
 *       <p>Readable prose</p>
 *     </breakin-layout>
 *   </region-layout>
 *
 *   <!-- Safe text zone inside a full-bleed breakout -->
 *   <region-layout pad-inline="l">
 *     <breakout-layout>
 *       <img src="bg.jpg" alt="" style="position:absolute;inset:0;…">
 *       <breakin-layout gutter="l">
 *         <h2>Overlay title stays in column</h2>
 *       </breakin-layout>
 *     </breakout-layout>
 *   </region-layout>
 *
 *   <!-- Pull quote inside a normal prose region -->
 *   <region-layout pad-inline="m">
 *     <p>Normal prose</p>
 *     <breakin-layout max="45ch">
 *       <blockquote>…extra narrow pull quote…</blockquote>
 *     </breakin-layout>
 *     <p>Back to full prose width</p>
 *   </region-layout>
 *
 *   <!-- Custom max with space token -->
 *   <breakin-layout max="xl" gutter="s">
 *     …
 *   </breakin-layout>
 *
 * @module @design-system/layout/breakin
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<breakin-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const BreakInLayoutElement = createDesignSystemLayoutElement({

    /**
     * max — maximum inline width of the content column.
     *
     * Accepts any named space token (xl, xxl, etc.) or any CSS length
     * (65ch, 80ch, 960px, 60rem, etc.).
     *
     * Uses box-sizing: content-box, so this is the CONTENT width —
     * gutter padding is additive (does not consume the max budget).
     *
     * Maps to: --ds-breakin-max (used as max-inline-size)
     * Default: --ds-measure (65ch)
     *
     * @example <breakin-layout max="45ch">  ← extra-narrow pull quote
     * @example <breakin-layout max="xl">    ← scale token
     */
    max: {
        type: 'space',
        var:  '--ds-breakin-max',
    },

    /**
     * gutter — inline padding for minimum breathing room.
     *
     * Prevents content from touching the edges of the parent container
     * when that container is narrower than `max`. Essential when
     * breakin-layout is inside a breakout-layout (which has no padding
     * of its own by default) or inside a zero-padding region.
     *
     * Set gutter to the same value as the nearest ancestor region's
     * pad-inline to restore the original column breathing room:
     *
     *   <region-layout pad-inline="l">
     *     <breakout-layout>            ← full-bleed, no padding
     *       <breakin-layout gutter="l"> ← restores l padding for text
     *         <p>Text in column</p>
     *       </breakin-layout>
     *     </breakout-layout>
     *   </region-layout>
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-breakin-gutter (used as padding-inline)
     * Default: 0px
     *
     * @example <breakin-layout gutter="m">
     */
    gutter: {
        type: 'space',
        var:  '--ds-breakin-gutter',
    },

});

/**
 * Registers the `<breakin-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/breakin';
 * define();
 */
export function define(): void {
    defineElement('breakin-layout', BreakInLayoutElement);
}
