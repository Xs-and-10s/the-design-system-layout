/**
 * @design-system/layout — containment-layout
 *
 * A performance and isolation primitive. Establishes CSS container
 * query scopes, CSS containment contexts, and optional content-visibility
 * optimization for off-screen content.
 *
 * ── THREE FEATURES IN ONE ELEMENT ────────────────────────────
 *
 * 1. Container queries (container-type, container-name):
 *    Makes this element a measurement point for @container CSS rules.
 *    Descendant styles can respond to THIS element's size rather than
 *    the viewport.
 *
 * 2. CSS containment (contain):
 *    Tells the browser that changes inside this element cannot affect
 *    the outside, enabling layout/paint performance optimizations.
 *
 * 3. Content visibility (content-visibility + contain-intrinsic-size):
 *    Skips rendering of off-screen content entirely. For long pages with
 *    many sections, this reduces initial render time dramatically.
 *    MUST be paired with contain-intrinsic-size to prevent scroll jumping.
 *
 * ── WHY A CUSTOM ELEMENT? ────────────────────────────────────
 *
 * Three of the CSS properties this element sets CANNOT be set via CSS
 * custom properties: container-name, container-type, and contain all
 * reject var() values — the browser ignores them. These must be set as
 * actual property values. The custom element sets them as inline styles,
 * which is the only dynamic mechanism available from HTML attributes.
 *
 * ── USAGE ────────────────────────────────────────────────────
 *
 *   <!-- Default: inline-size container query scope -->
 *   <containment-layout>
 *     <card-component>…</card-component>
 *   </containment-layout>
 *
 *   <!-- Named container for targeted @container queries -->
 *   <containment-layout name="sidebar">
 *     <nav>…</nav>
 *   </containment-layout>
 *   <!-- In CSS: @container sidebar (min-inline-size: 200px) { … } -->
 *
 *   <!-- Both-axis container for width AND height queries -->
 *   <containment-layout type="size" style="block-size: 400px">
 *     <chart>…</chart>
 *   </containment-layout>
 *   <!-- In CSS: @container (min-block-size: 300px) { … } -->
 *
 *   <!-- content-visibility: skip off-screen rendering -->
 *   <!-- MUST include contain-intrinsic-size to prevent scroll jump -->
 *   <containment-layout
 *     content-visibility="auto"
 *     contain-intrinsic-size="0 600px"
 *   >
 *     <region-layout>…long section content…</region-layout>
 *   </containment-layout>
 *
 *   <!-- Paint containment: clip descendant z-index layers -->
 *   <containment-layout contain="layout paint">
 *     <dropdown-menu>…</dropdown-menu>
 *   </containment-layout>
 *
 *   <!-- Named container + content-visibility -->
 *   <containment-layout
 *     name="main-content"
 *     content-visibility="auto"
 *     contain-intrinsic-size="auto 500px"
 *   >
 *     <stacked-layout>…</stacked-layout>
 *   </containment-layout>
 *
 * @module @design-system/layout/containment
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<containment-layout>`.
 *
 * Uses the factory (not a full custom class) because the factory's
 * `spec.prop` mechanism sets values directly as inline CSS properties —
 * which is exactly what container-name, container-type, and contain require.
 *
 * `contain-intrinsic-size` is special: it uses BOTH `prop` AND `var` so
 * the factory applies it both as a direct inline style (for correctness)
 * and as a CSS custom property (so CSS can observe or override it).
 *
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const ContainmentLayoutElement = createDesignSystemLayoutElement({

    /**
     * name — container-name.
     *
     * Names this container so @container rules can target it specifically:
     *   @container sidebar (min-inline-size: 200px) { … }
     *
     * Without a name, the container is still queryable but only by its
     * relationship to descendants (nearest ancestor matching the query).
     *
     * Must be a valid CSS custom-ident (no spaces, not a CSS keyword).
     *
     * IMPORTANT: container-name cannot be set via CSS custom property —
     * `container-name: var(--x)` is invalid. This JS element sets it as
     * a direct inline style property, which is the only mechanism that
     * allows HTML attributes to control it.
     *
     * Maps to: inline style `container-name` (NOT a custom property)
     * Default: no name (unnamed containers are still queryable)
     *
     * @example <containment-layout name="sidebar">
     * @example <containment-layout name="main-content">
     */
    name: {
        type: 'raw',
        prop: 'container-name',
    },

    /**
     * type — container-type.
     *
     * Establishes the axis or axes available for @container queries:
     *   "inline-size" — query the inline (width) axis (default, most useful)
     *   "size"        — query both inline and block axes; element needs
     *                   explicit height for block-size queries to work
     *   "normal"      — container exists but has no query axis (useful
     *                   with `name` alone for opt-in query targeting)
     *
     * IMPORTANT: container-type cannot be set via CSS custom property.
     * This JS element sets it directly as an inline style.
     * When absent, the CSS default (`inline-size` from containment.css) applies.
     *
     * Maps to: inline style `container-type` (NOT a custom property)
     * Default: inline-size (from CSS, not JS — so absent = CSS default wins)
     *
     * @example <containment-layout type="size" style="block-size: 400px">
     * @example <containment-layout type="normal" name="layout-root">
     */
    type: {
        type: 'raw',
        prop: 'container-type',
    },

    /**
     * contain — CSS containment property.
     *
     * Tells the browser that changes inside this element cannot affect
     * the outside, unlocking layout/paint performance optimizations.
     *
     * Values (combinable with spaces):
     *   layout      — layout is fully contained (no layout side-effects)
     *   paint       — painting clipped to border box; descendant stacking
     *                 contexts cannot appear outside this element
     *   style       — CSS counters and quotes scoped to this element
     *   size        — size is independent of content (needs explicit height)
     *   inline-size — size containment on inline axis only
     *   content     — shorthand: layout + paint
     *   strict      — shorthand: layout + paint + size
     *   none        — no containment
     *
     * Note: container-type: inline-size already implies layout + style
     * containment automatically. You don't need `contain="layout style"` on
     * top of the default container-type. Adding `contain="paint"` is the
     * most useful addition for clip-to-border-box behavior.
     *
     * IMPORTANT: contain cannot be set via CSS custom property.
     * Set as a direct inline style.
     *
     * Maps to: inline style `contain` (NOT a custom property)
     * Default: unset (container-type provides layout + style implicitly)
     *
     * @example <containment-layout contain="layout paint">
     * @example <containment-layout contain="paint">
     * @example <containment-layout contain="content">  ← layout + paint
     */
    contain: {
        type: 'raw',
        prop: 'contain',
    },

    /**
     * content-visibility — skip rendering of off-screen content.
     *
     * "auto" is the useful value: the browser skips all rendering work
     * (layout, paint, compositing) for elements that are off-screen. As
     * the user scrolls, elements are rendered just-in-time.
     *
     * For pages with many sections (long-form articles, dashboards, feed-
     * style layouts), content-visibility: auto can reduce initial render
     * time by 50–80% by deferring all off-screen sections.
     *
     * Values:
     *   auto    — skip rendering when off-screen; render when visible
     *   hidden  — always skip rendering (content exists in DOM but is
     *             not painted and not in the accessibility tree);
     *             similar to display: none but preserves layout space
     *   visible — normal rendering (CSS default; setting this has no effect)
     *
     * ⚠ CRITICAL: When using "auto", you MUST also set contain-intrinsic-size.
     * Without it, the browser doesn't know how much space to reserve for the
     * element when it's off-screen — all off-screen elements collapse to 0
     * height, causing the scrollbar to jump dramatically as the user scrolls.
     *
     * Maps to: inline style `content-visibility`
     * Default: unset (browser default: visible)
     *
     * @example
     * <containment-layout
     *   content-visibility="auto"
     *   contain-intrinsic-size="0 500px"
     * >
     *   <region-layout>…</region-layout>
     * </containment-layout>
     */
    'content-visibility': {
        type: 'raw',
        prop: 'content-visibility',
    },

    /**
     * contain-intrinsic-size — estimated size for off-screen content.
     *
     * Required when using content-visibility="auto". Tells the browser
     * how much space to reserve for the element when it's off-screen
     * (i.e., when rendering is skipped). Without this, off-screen elements
     * collapse to 0, causing scroll-position jumps as the user scrolls down.
     *
     * The value is an ESTIMATE. When the element is on-screen, the browser
     * measures its actual content and uses the real size. The intrinsic size
     * is only used as a placeholder when off-screen.
     *
     * Syntax options:
     *   "500px"          — both inline and block axes estimated at 500px
     *   "0 500px"        — inline: 0 (auto), block: ~500px (most common)
     *   "auto 500px"     — use last-known block size, fallback 500px
     *   "auto 300px 200px" — inline: auto 300px, block: auto 200px
     *
     * Tips:
     *   - Underestimating is better than overestimating — the scrollbar may
     *     grow but won't shrink unexpectedly.
     *   - Use `auto <size>` (with the `auto` keyword) to use the browser's
     *     memorized size from the last time the element was on-screen, with
     *     `<size>` as the initial fallback. This is the most accurate value
     *     for content that varies in height (e.g. CMS-authored sections).
     *
     * This attribute is unique: it's applied BOTH as an inline CSS property
     * (for correctness) AND as a CSS custom property --ds-containment-intrinsic-size
     * (so CSS cascade rules can override or inherit it, and for DevTools visibility).
     *
     * Maps to:
     *   inline style `contain-intrinsic-size`
     *   --ds-containment-intrinsic-size (also, for CSS cascade)
     * Default: unset
     *
     * @example <containment-layout content-visibility="auto" contain-intrinsic-size="0 600px">
     * @example <containment-layout content-visibility="auto" contain-intrinsic-size="auto 400px">
     */
    'contain-intrinsic-size': {
        type: 'raw',
        prop: 'contain-intrinsic-size',
        var:  '--ds-containment-intrinsic-size',
    },

});

/**
 * Registers the `<containment-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/containment';
 * define();
 */
export function define(): void {
    defineElement('containment-layout', ContainmentLayoutElement);
}
