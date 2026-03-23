/**
 * @design-system/layout — split-layout
 *
 * A responsive row. In default mode, children automatically switch
 * between a horizontal row (wide containers) and a vertical stack
 * (narrow containers) using the CSS Switcher technique. All children
 * switch simultaneously at the threshold.
 *
 * [horizontally] fixes children in a horizontal row, shrinking them
 * proportionally when the container is too narrow.
 *
 * [vertically] fixes children in a vertical stack.
 *
 * Usage:
 *   <!-- Auto-switching (default) -->
 *   <split-layout>
 *     <article>…</article>
 *     <article>…</article>
 *     <article>…</article>
 *   </split-layout>
 *
 *   <!-- Custom threshold -->
 *   <split-layout threshold="60rem">
 *     <card>…</card>
 *     <card>…</card>
 *   </split-layout>
 *
 *   <!-- Force horizontal with vertical rule dividers -->
 *   <split-layout horizontally divider="opaque" gap="m">
 *     <stat>…</stat>
 *     <stat>…</stat>
 *     <stat>…</stat>
 *   </split-layout>
 *
 *   <!-- Vertical stack with horizontal rule dividers -->
 *   <split-layout vertically divider="translucent">
 *     <region-layout>…</region-layout>
 *     <region-layout>…</region-layout>
 *   </split-layout>
 *
 *   <!-- Custom divider color -->
 *   <split-layout divider="opaque" divider-color="var(--brand-accent)">
 *     …
 *   </split-layout>
 *
 * @module @design-system/layout/split
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<split-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const SplitLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — space between children.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-split-gap
     * Default: --ds-gap (layout gap from core tokens)
     *
     * @example <split-layout gap="xl">
     */
    gap: {
        type: 'space',
        var:  '--ds-split-gap',
    },

    /**
     * threshold — width at which auto-switch mode changes layout direction.
     *
     * When the container inline-size is ABOVE this threshold, children
     * form a horizontal row. Below it, children stack vertically.
     *
     * Only affects the default auto-switch mode. Ignored when
     * [horizontally] or [vertically] attributes are present.
     *
     * Accepts space tokens (for scale-coherent breakpoints) or any
     * CSS length: 45rem, 768px, 60ch, etc.
     *
     * Note: the threshold is approximate — it does not account for
     * gap between children. See split.css for details.
     *
     * Maps to: --ds-split-threshold
     * Default: --ds-threshold (45rem from core tokens)
     *
     * @example <split-layout threshold="60rem">
     * @example <split-layout threshold="xl">  ← scale token breakpoint
     */
    threshold: {
        type: 'space',
        var:  '--ds-split-threshold',
    },

    /**
     * divider-color — color of the divider rule between children.
     *
     * Accepts any CSS color value. The divider type (opaque, translucent,
     * transparent, invisible, absent) is set via the [divider] attribute,
     * which is handled purely in CSS.
     *
     * Maps to: --ds-split-divider-color
     * Default: --ds-color-border (from core semantic color tokens)
     *
     * @example <split-layout divider="opaque" divider-color="oklch(50% 0.2 250)">
     */
    'divider-color': {
        type: 'raw',
        var:  '--ds-split-divider-color',
    },

    /*
        Note: the following boolean/categorical attributes are not listed
        here because they require no JS side effects:

        [horizontally]        — CSS: flex-wrap: nowrap, flex-basis: auto
        [vertically]          — CSS: flex-direction: column
        [divider="<type>"]    — CSS: border on * + * children with type variants

        Only include attributes in this map when JS must react to them.
        Pure visual/layout mode switches belong in CSS attribute selectors.
    */

});

/**
 * Registers the `<split-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/split';
 * define();
 */
export function define(): void {
    defineElement('split-layout', SplitLayoutElement);
}
