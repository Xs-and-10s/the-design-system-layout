/**
 * @design-system/layout — cluster-layout
 *
 * A wrapping flex row. Children flow inline and wrap onto new lines
 * when they run out of space. The canonical primitive for tag clouds,
 * badge groups, button toolbars, navigation pill sets, and any
 * collection of inline items that should reflow naturally.
 *
 * Default behavior: wraps, layout gap, center cross-axis alignment,
 * flex-start main-axis alignment.
 *
 * Usage:
 *   <!-- Basic cluster with layout gap -->
 *   <cluster-layout>
 *     <tag>css</tag><tag>layout</tag><tag>design-systems</tag>
 *   </cluster-layout>
 *
 *   <!-- Button toolbar with touch-aware UI gap -->
 *   <cluster-layout ui>
 *     <button>Save</button>
 *     <button>Cancel</button>
 *   </cluster-layout>
 *
 *   <!-- Custom gap, centered -->
 *   <cluster-layout gap="xl" justify="center">
 *     <card>…</card><card>…</card><card>…</card>
 *   </cluster-layout>
 *
 *   <!-- Horizontal scroll strip on small screens -->
 *   <div style="overflow-x: auto">
 *     <cluster-layout no-wrap gap="s">
 *       <chip>Option A</chip><chip>Option B</chip>…
 *     </cluster-layout>
 *   </div>
 *
 * @module @design-system/layout/cluster
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<cluster-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export const clusterLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — spacing between children.
     *
     * Accepts any named space token from the design system scale:
     *   tiny, xxxs, xxs, xs, s, m, l, xl, xxl, xxxl, huge
     *   or any adjacent half-step pair: xs-s, s-m, m-l, etc.
     * Also accepts any arbitrary CSS length: 2rem, 8px, 0.5em, etc.
     *
     * When set explicitly, this always wins over the [ui] gap mode —
     * the inline style applied by the JS element has higher cascade
     * priority than the [ui] CSS attribute selector rule.
     *
     * Default (no gap attribute, no [ui]):  --ds-gap (layout gap)
     * Default (no gap attribute, [ui] set): --ds-gap-ui (pointer-aware)
     *
     * Maps to: --ds-cluster-gap
     */
    gap: {
        type: 'space',
        var:  '--ds-cluster-gap',
    },

    /**
     * align — cross-axis (vertical) alignment of children.
     *
     * Accepts any valid CSS align-items keyword:
     *   center   — vertically centered (default; right for most clusters)
     *   start    — aligned to the top edge
     *   end      — aligned to the bottom edge
     *   stretch  — stretched to fill the tallest child's height
     *   baseline — aligned by text baseline (useful for mixed-size type)
     *
     * Maps to: --ds-cluster-align (read by align-items in CSS)
     * Default: center
     */
    align: {
        type: 'raw',
        var:  '--ds-cluster-align',
    },

    /**
     * justify — main-axis (horizontal) distribution of children.
     *
     * Accepts any valid CSS justify-content keyword:
     *   flex-start   — packed toward the start (default)
     *   flex-end     — packed toward the end
     *   center       — centered as a group
     *   space-between — first and last touch edges, remainder distributed
     *   space-around  — equal space around each child
     *   space-evenly  — equal space between and around all children
     *
     * Note: justify-content affects the whole row when items don't fill it.
     * In a wrapping cluster, each line is justified independently.
     *
     * Maps to: --ds-cluster-justify (read by justify-content in CSS)
     * Default: flex-start
     */
    justify: {
        type: 'raw',
        var:  '--ds-cluster-justify',
    },

    /*
        Note: the [ui] and [no-wrap] boolean attributes are not listed
        here because they require no JS side effects — they are handled
        entirely by CSS attribute selectors in cluster.css.

        [ui]:      switches the default gap to --ds-gap-ui (touch-aware)
        [no-wrap]: sets flex-wrap: nowrap for horizontal scroll patterns
    */

});

/**
 * Registers the `<cluster-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/cluster';
 * define();
 */
export function define(): void {
    defineElement('cluster-layout', clusterLayoutElement);
}
