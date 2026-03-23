/**
 * @design-system/layout — icon-text-layout
 *
 * An inline flex container pairing an icon with a text label.
 * The first child is the icon (sized as a square); the second
 * (last) child is the text label.
 *
 * The icon tracks the surrounding font size by default (1em),
 * so icon-text-layout pairs scale naturally with any text context
 * without needing explicit size overrides.
 *
 * Structure:
 *   <icon-text-layout>
 *     <svg>…</svg>       ← icon: first child, always
 *     <span>Label</span> ← text: last child
 *   </icon-text-layout>
 *
 * Usage:
 *   <!-- Default: icon left, text right, 1em icon -->
 *   <icon-text-layout>
 *     <svg aria-hidden="true">…</svg>
 *     <span>Search</span>
 *   </icon-text-layout>
 *
 *   <!-- Larger icon from space scale -->
 *   <icon-text-layout size="l">
 *     <svg aria-hidden="true">…</svg>
 *     <span>Download</span>
 *   </icon-text-layout>
 *
 *   <!-- Fixed pixel size -->
 *   <icon-text-layout size="24px">
 *     <svg aria-hidden="true">…</svg>
 *     <span>Settings</span>
 *   </icon-text-layout>
 *
 *   <!-- Text-scale sizing (pass token as value) -->
 *   <icon-text-layout size="var(--ds-text-xl)">
 *     <svg aria-hidden="true">…</svg>
 *     <span>Heading with icon</span>
 *   </icon-text-layout>
 *
 *   <!-- Icon on the right (reversed visual order) -->
 *   <icon-text-layout reverse>
 *     <svg aria-hidden="true">…</svg>
 *     <span>Next</span>
 *   </icon-text-layout>
 *
 *   <!-- Icon above text (vertical stack, tab bar style) -->
 *   <icon-text-layout vertical>
 *     <svg aria-hidden="true">…</svg>
 *     <span>Home</span>
 *   </icon-text-layout>
 *
 *   <!-- Baseline alignment for mixed text sizes -->
 *   <icon-text-layout align="baseline">
 *     <svg aria-hidden="true">…</svg>
 *     <span>File</span>
 *   </icon-text-layout>
 *
 *   <!-- Custom gap -->
 *   <icon-text-layout gap="xs">
 *     <svg aria-hidden="true">…</svg>
 *     <span>Compact</span>
 *   </icon-text-layout>
 *
 * Accessibility note:
 *   Add aria-hidden="true" to the icon element when the text label
 *   is present — the label is the accessible name. If you use
 *   icon-text-layout in a button or link without a visible label,
 *   add aria-label to the button/link and aria-hidden to both the
 *   icon-text-layout and its children.
 *
 * @module @design-system/layout/icon-text
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<icon-text-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const IconTextLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — space between icon and text.
     *
     * Accepts any named space token or CSS length.
     * The default is tighter than the layout gap — appropriate for
     * the close coupling of an icon with its label.
     *
     * Maps to: --ds-icon-text-gap
     * Default: --ds-space-xs-s (between xs and s — a tight inline gap)
     *
     * @example <icon-text-layout gap="xs">   ← very tight
     * @example <icon-text-layout gap="s">    ← comfortable
     * @example <icon-text-layout gap="8px">
     */
    gap: {
        type: 'space',
        var:  '--ds-icon-text-gap',
    },

    /**
     * size — icon size (both width and height — icons are square).
     *
     * Accepts any named space token (from the design system scale)
     * or any CSS dimension value.
     *
     * The default (1em) tracks the surrounding font size automatically.
     * In a paragraph, the icon is text-height. In a heading, it is
     * heading-height. No explicit size needed unless you want to
     * deviate from the natural text size.
     *
     * For icons that should track the text scale specifically (rather
     * than the space scale), pass the text token as a raw CSS value:
     *   size="var(--ds-text-xl)"
     *
     * Maps to: --ds-icon-size
     * Default: 1em
     *
     * @example <icon-text-layout size="l">      ← space-l from scale
     * @example <icon-text-layout size="24px">   ← fixed pixel size
     * @example <icon-text-layout size="1.5em">  ← relative to font size
     * @example <icon-text-layout size="var(--ds-text-xl)">  ← text scale
     */
    size: {
        type: 'space',
        var:  '--ds-icon-size',
    },

    /**
     * align — cross-axis alignment of icon and text.
     *
     * In horizontal mode (default and [reverse]):
     *   center     — vertically centered (default; good for single-line)
     *   baseline   — aligned to the text baseline
     *                (best when icon height ≠ line height)
     *   flex-start — aligned to the top edge
     *                (best for multi-line text labels)
     *   flex-end   — aligned to the bottom edge (rare)
     *
     * In [vertical] mode:
     *   center     — horizontally centered (default; almost always correct)
     *   flex-start — aligned to the inline-start edge
     *
     * Maps to: --ds-icon-text-align (used as align-items in CSS)
     * Default: center
     *
     * @example <icon-text-layout align="baseline">
     * @example <icon-text-layout align="flex-start">
     */
    align: {
        type: 'raw',
        var:  '--ds-icon-text-align',
    },

    /*
        Note: the following boolean attributes are not listed here
        because they require no JS side effects — they are handled
        entirely by CSS attribute selectors in icon-text.css:

        [reverse]  — reverses visual order (text before icon)
                     via flex-direction: row-reverse.
                     DOM order is unchanged for correct a11y tab order.

        [vertical] — stacks icon above text
                     via flex-direction: column.
    */

});

/**
 * Registers the `<icon-text-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/icon-text';
 * define();
 */
export function define(): void {
    defineElement('icon-text-layout', IconTextLayoutElement);
}
