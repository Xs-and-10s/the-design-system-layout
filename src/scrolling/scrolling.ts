/**
 * @design-system/layout — scrolling-layout
 *
 * A scroll container. Wraps content that scrolls on one or both
 * axes, with optional snap, scrollbar control, and peek behavior.
 *
 * Replaces the original `side-scrolling` module (horizontal-only)
 * with a fully parameterized, axis-aware scroll primitive.
 *
 * ── MODE QUICK REFERENCE ──────────────────────────────────────
 *   (no attributes)           vertical scroll   display: block
 *   [horizontally]            horizontal scroll  display: flex
 *   [vertically]              vertical scroll    display: block (explicit)
 *   [horizontally][vertically] 2D scroll         display: block
 *
 * ── REMOVED: -webkit-overflow-scrolling: touch ────────────────
 * This property was deprecated and ignored since iOS 13 (2019).
 * Modern iOS applies momentum scrolling to all overflow: auto
 * containers by default. It has been removed with no replacement.
 *
 * Usage:
 *   <!-- Vertical scroll (default) -->
 *   <scrolling-layout style="max-block-size: 400px">
 *     <stacked-layout>
 *       <p>…</p><p>…</p><p>…</p>
 *     </stacked-layout>
 *   </scrolling-layout>
 *
 *   <!-- Horizontal scroll (side-scrolling / carousel) -->
 *   <scrolling-layout horizontally item="280px" gap="m">
 *     <card>…</card><card>…</card><card>…</card>
 *   </scrolling-layout>
 *
 *   <!-- Horizontal scroll with snap — stops at each card -->
 *   <scrolling-layout horizontally snap-horizontally snap-stop item="280px">
 *     <card>…</card><card>…</card><card>…</card>
 *   </scrolling-layout>
 *
 *   <!-- Peek: shows edge of adjacent items -->
 *   <scrolling-layout horizontally peek="l" item="280px">
 *     <card>…</card><card>…</card><card>…</card>
 *   </scrolling-layout>
 *
 *   <!-- Hidden scrollbar horizontal strip -->
 *   <scrolling-layout horizontally no-bar-horizontally item="auto">
 *     <chip>Tag A</chip><chip>Tag B</chip>…
 *   </scrolling-layout>
 *
 *   <!-- Vertical snap-scroll sections -->
 *   <scrolling-layout vertically snap-vertically smooth
 *                     style="block-size: 100dvh">
 *     <section style="block-size: 100%">Section 1</section>
 *     <section style="block-size: 100%">Section 2</section>
 *   </scrolling-layout>
 *
 *   <!-- Stable gutter — no layout shift when content grows -->
 *   <scrolling-layout stable-gutter style="max-block-size: 600px">
 *     <stacked-layout>…</stacked-layout>
 *   </scrolling-layout>
 *
 *   <!-- 2D scroll (spreadsheet, map, etc.) -->
 *   <scrolling-layout horizontally vertically
 *                     style="block-size: 400px; inline-size: 100%">
 *     <div style="inline-size: 2000px; block-size: 1000px">…</div>
 *   </scrolling-layout>
 *
 * @module @design-system/layout/scrolling
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<scrolling-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const ScrollingLayoutElement = createDesignSystemLayoutElement({

    /**
     * gap — space between children.
     *
     * Only applies in [horizontally] mode (display: flex).
     * In default/vertical mode (display: block), gap has no effect —
     * use a stacked-layout child to control vertical spacing.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-scrolling-gap
     * Default: --ds-gap (layout gap from core tokens)
     *
     * @example <scrolling-layout horizontally gap="l">
     */
    gap: {
        type: 'space',
        var:  '--ds-scrolling-gap',
    },

    /**
     * pad-block — block-axis (top/bottom) padding.
     *
     * In horizontal scroll mode, provides breathing room above and
     * below the scroll strip — useful for showing box shadows on items.
     * Note: overflow-y: hidden clips content beyond the container;
     * pad-block gives room within the padding area, but does not
     * make overflow: visible on the block axis.
     *
     * In vertical mode, provides inset from the container's block edges.
     * Overridden by `peek` when peek is set.
     *
     * Maps to: --ds-scrolling-pad-block
     * Default: 0px
     *
     * @example <scrolling-layout horizontally pad-block="s">
     */
    'pad-block': {
        type: 'space',
        var:  '--ds-scrolling-pad-block',
    },

    /**
     * pad-inline — inline-axis (left/right) padding.
     *
     * In vertical mode, inset from the container's inline edges.
     * In horizontal mode, overridden by `peek` when peek is set.
     *
     * Maps to: --ds-scrolling-pad-inline
     * Default: 0px
     *
     * @example <scrolling-layout vertically pad-inline="m">
     */
    'pad-inline': {
        type: 'space',
        var:  '--ds-scrolling-pad-inline',
    },

    /**
     * item — flex-basis (width) of direct children in [horizontally] mode.
     *
     * Sets each item to a fixed or intrinsic width. When set, children
     * do not grow or shrink (flex: 0 0 <item>). This creates a uniform
     * grid of scroll items.
     *
     * Accepts any named space token or CSS dimension.
     *
     * Was `type: 'raw'` in the original, which caused a regression after
     * the SPACE_TOKENS allowlist fix: `item="m"` would pass through as
     * the literal string "m" → flex-basis: m → invalid CSS, silently
     * ignored. Now correctly typed as 'space'.
     *
     * Maps to: --ds-scrolling-item
     * Default: auto (children size to their intrinsic content width)
     *
     * @example <scrolling-layout horizontally item="280px">
     * @example <scrolling-layout horizontally item="xl">  ← space token
     * @example <scrolling-layout horizontally item="80vw"> ← responsive
     */
    item: {
        type: 'space',
        var:  '--ds-scrolling-item',
    },

    /**
     * peek — inset peek amount on the scroll axis.
     *
     * Creates a partial glimpse of the adjacent item at the container
     * edge, signaling to users that more content is available to scroll.
     * Combined with scroll-padding to keep snap alignment correct.
     *
     * Axis:
     *   [horizontally]: applied as padding-inline (left + right inset)
     *   [vertically]:   applied as padding-block  (top + bottom inset)
     *   both axes:      applied as both
     *
     * Overrides pad-block or pad-inline in the respective mode.
     * If you need both peek AND explicit orthogonal axis padding,
     * set pad-inline (for peek in vertical mode) or pad-block
     * (for padding in horizontal mode) independently.
     *
     * Accepts any named space token or CSS length.
     *
     * Maps to: --ds-scrolling-peek
     * Default: not set (no peek)
     *
     * @example <scrolling-layout horizontally peek="l" item="280px">
     */
    peek: {
        type: 'space',
        var:  '--ds-scrolling-peek',
    },

    /**
     * overscroll — overscroll-behavior of the container.
     *
     * Controls what happens when scrolling past the end of the container.
     * Accepts any CSS overscroll-behavior value:
     *   contain  — prevent scroll chaining to parent (default)
     *   auto     — allow scroll chaining (browser default)
     *   none     — prevent chaining AND disable pull-to-refresh / bounce
     *
     * Default "contain" is correct for most nested scroll containers.
     * Set to "auto" for the outermost scroll container when you want
     * native pull-to-refresh (e.g. if scrolling-layout wraps the page).
     *
     * Maps to: --ds-scrolling-overscroll
     * Default: contain
     *
     * @example <scrolling-layout overscroll="auto"> ← for page-level container
     * @example <scrolling-layout overscroll="none">  ← disable bounce + chaining
     */
    overscroll: {
        type: 'raw',
        var:  '--ds-scrolling-overscroll',
    },

    /**
     * align — align-items for [horizontally] mode.
     *
     * Controls vertical alignment of items in the flex row.
     * Has no effect in default/vertical mode (display: block).
     *
     * Values:
     *   start      — align to the top (default; safest for variable-height items)
     *   center     — vertically center all items
     *   end        — align to the bottom
     *   stretch    — stretch all items to the tallest item's height
     *   baseline   — align by first text baseline
     *
     * Maps to: --ds-scrolling-align (used as align-items in CSS)
     * Default: start
     *
     * @example <scrolling-layout horizontally align="center">
     */
    align: {
        type: 'raw',
        var:  '--ds-scrolling-align',
    },

    /*
        CSS-only boolean attributes (not in varMap):

        [horizontally]          — enable horizontal scroll (display: flex)
        [vertically]            — enable vertical scroll (explicit; same
                                  as default but enables peek on block axis)
        [snap-horizontally]     — x-axis snap (scroll-snap-type: x mandatory)
        [snap-vertically]       — y-axis snap (scroll-snap-type: y mandatory)
        [snap-stop]             — force stop at every snap point on children
                                  (scroll-snap-stop: always)
        [no-bar]                — hide all scrollbars
        [no-bar-horizontally]   — hide scrollbar (horizontal-only convenience)
        [no-bar-vertically]     — hide scrollbar (vertical-only convenience)
        [stable-gutter]         — reserve scrollbar gutter always
                                  (scrollbar-gutter: stable)
        [smooth]                — smooth programmatic scrolling
                                  (scroll-behavior: smooth)

        Note on [no-bar-horizontally] / [no-bar-vertically]:
        There is no CSS mechanism to independently hide only the x-axis
        scrollbar while keeping the y-axis scrollbar (or vice versa) on
        the same element. Both attributes hide ALL scrollbars on the
        element — they are semantic aliases for the common single-axis
        case where "no-bar-horizontally" happens to mean "the only
        scrollbar on this element is horizontal, and I want it hidden."
        In 2D mode ([horizontally][vertically]), use [no-bar] to be explicit.
    */

});

/**
 * Registers the `<scrolling-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/scrolling';
 * define();
 */
export function define(): void {
    defineElement('scrolling-layout', ScrollingLayoutElement);
}
