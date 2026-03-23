/**
 * @design-system/layout — region-layout
 *
 * A page section container. The fundamental building block for vertical
 * page structure: a distinct section with block padding, optional
 * background, and optional scroll snap behavior.
 *
 * region-layout establishes --ds-region-pad-inline as an inheritable
 * CSS custom property, which breakout-layout and breakin-layout
 * descendants read to coordinate their sizing.
 *
 * Linking to sections:
 *   Use the native HTML `id` attribute for anchor links and
 *   programmatic scrolling (scrollIntoView, scrollTo, etc.).
 *   The `scroll-margin` attribute compensates for sticky headers.
 *
 * Snap scrolling:
 *   Add [snap] to this element AND set scroll-snap-type on the
 *   scroll container (usually <body> or a scroll wrapper div).
 *
 * Usage:
 *   <!-- Basic section -->
 *   <region-layout id="about">
 *     <h2>About</h2>
 *     <p>…</p>
 *   </region-layout>
 *
 *   <!-- Section with custom spacing and background -->
 *   <region-layout id="hero" pad-block="huge" pad-inline="xl" bg="var(--brand-surface)">
 *     …
 *   </region-layout>
 *
 *   <!-- Snap-scrollable section -->
 *   <region-layout id="services" snap>…</region-layout>
 *
 *   <!-- Section with full-bleed child -->
 *   <region-layout id="gallery" pad-inline="m">
 *     <breakout-layout>
 *       <img src="banner.jpg" alt="…">
 *     </breakout-layout>
 *     <p>Caption below the full-bleed image</p>
 *   </region-layout>
 *
 *   <!-- Compensate for a 64px sticky header globally -->
 *   <!-- Set in your CSS: :root { --ds-region-scroll-margin: 64px; } -->
 *
 * @module @design-system/layout/region
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<region-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const RegionLayoutElement = createDesignSystemLayoutElement({

    /**
     * pad-block — block-axis (top/bottom in horizontal writing) padding.
     *
     * Accepts any named space token or CSS length.
     * This controls the vertical breathing room between sections.
     *
     * Maps to: --ds-region-pad-block
     * Default: --ds-space-l-xl (generous section spacing)
     *
     * @example <region-layout pad-block="huge">
     * @example <region-layout pad-block="6rem">
     */
    'pad-block': {
        type: 'space',
        var:  '--ds-region-pad-block',
    },

    /**
     * pad-inline — inline-axis (left/right in LTR) padding.
     *
     * This attribute does two things:
     * 1. Controls the left/right padding of the region itself.
     * 2. Sets --ds-region-pad-inline as an inline style on the element,
     *    which ALL descendant elements (including deeply nested ones)
     *    can read via CSS inheritance.
     *
     * breakout-layout children read --ds-region-pad-inline to compute
     * their negative margin, creating a full-bleed effect that exactly
     * counteracts this padding.
     *
     * Maps to: --ds-region-pad-inline
     * Default: --ds-gap (layout gap from core tokens)
     *
     * @example <region-layout pad-inline="xl">
     */
    'pad-inline': {
        type: 'space',
        var:  '--ds-region-pad-inline',
    },

    /**
     * bg — background of the section.
     *
     * Accepts any CSS background value: color, gradient, image, etc.
     * Using semantic color tokens is recommended for theme consistency:
     *   bg="var(--brand-surface)"
     *   bg="oklch(95% 0.02 250)"
     *
     * Maps to: --ds-region-bg
     * Default: transparent
     */
    bg: {
        type: 'raw',
        var:  '--ds-region-bg',
    },

    /**
     * scroll-margin — scroll-margin-block-start offset.
     *
     * When the user clicks an anchor link to this section (e.g.
     * `href="#contact"`), the browser positions the section at the
     * top of the viewport. If there's a sticky header, the section's
     * heading hides behind it. scroll-margin adds an offset so the
     * browser positions the section below the sticky header.
     *
     * For a consistent sticky header height across all sections,
     * prefer the global token approach over per-section attributes:
     *   :root { --ds-region-scroll-margin: 64px; }
     *
     * Use this attribute for per-section overrides.
     *
     * Maps to: --ds-region-scroll-margin
     * Default: 0px
     *
     * @example <region-layout scroll-margin="4rem">
     */
    'scroll-margin': {
        type: 'raw',
        var:  '--ds-region-scroll-margin',
    },

    /*
        Note: the [snap] boolean attribute is not listed here because
        it requires no JS side effects — it is handled entirely by a
        CSS attribute selector in region.css.

        [snap]: sets scroll-snap-align: start on this section.
        The scroll container must also configure scroll-snap-type.
    */

});

/**
 * Registers the `<region-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/region';
 * define();
 */
export function define(): void {
    defineElement('region-layout', RegionLayoutElement);
}
