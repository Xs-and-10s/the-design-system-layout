/**
 * @design-system/layout — quadrilateral-layout
 *
 * A box model primitive. Controls padding, border, border-radius,
 * background, foreground color, and box-shadow declaratively via
 * HTML attributes. Has no layout algorithm of its own.
 *
 * All padding and border attributes use CSS logical property names:
 *   block-start = top (in horizontal LTR)    block-end  = bottom
 *   inline-start = left (in horizontal LTR)  inline-end  = right
 *
 * Usage:
 *   <quadrilateral-layout pad="m">…</quadrilateral-layout>
 *   <quadrilateral-layout pad="l" pad-inline="xl">…</quadrilateral-layout>
 *   <quadrilateral-layout border="1px solid currentColor" radius="s">…</quadrilateral-layout>
 *   <quadrilateral-layout bg="var(--my-surface)" shadow="0 2px 8px #0002">…</quadrilateral-layout>
 *
 * @module @design-system/layout/quadrilateral
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<quadrilateral-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 * Most consumers should use `define()` and the HTML element directly.
 */
export const QuadrilateralLayoutElement = createDesignSystemLayoutElement({

    /* ── Padding ─────────────────────────────────────────────
       Three-level resolution in CSS:
         individual side → axis shorthand → global shorthand → 0

       All attributes accept named space tokens (m, xl, s-m, etc.)
       or arbitrary CSS length values (1rem, 8px, etc.).
    ──────────────────────────────────────────────────────────── */

    /**
     * pad — padding on all four sides.
     * The base of the padding resolution chain.
     * Maps to: --ds-quad-pad
     * @example <quadrilateral-layout pad="m">
     */
    pad: {
        type: 'space',
        var:  '--ds-quad-pad',
    },

    /**
     * pad-block — padding on block-start and block-end (top + bottom in LTR).
     * Overrides `pad` on the block axis. Individual sides override this.
     * Maps to: --ds-quad-pad-block
     * @example <quadrilateral-layout pad="m" pad-block="xl">
     */
    'pad-block': {
        type: 'space',
        var:  '--ds-quad-pad-block',
    },

    /**
     * pad-inline — padding on inline-start and inline-end (left + right in LTR).
     * Overrides `pad` on the inline axis. Individual sides override this.
     * Maps to: --ds-quad-pad-inline
     * @example <quadrilateral-layout pad="m" pad-inline="xl">
     */
    'pad-inline': {
        type: 'space',
        var:  '--ds-quad-pad-inline',
    },

    /**
     * pbs — padding-block-start (top in horizontal LTR writing).
     * Most specific padding override on the block-start side.
     * Maps to: --ds-quad-pbs
     * @example <quadrilateral-layout pad="m" pbs="xl">
     */
    pbs: {
        type: 'space',
        var:  '--ds-quad-pbs',
    },

    /**
     * pbe — padding-block-end (bottom in horizontal LTR writing).
     * Most specific padding override on the block-end side.
     * Maps to: --ds-quad-pbe
     */
    pbe: {
        type: 'space',
        var:  '--ds-quad-pbe',
    },

    /**
     * pis — padding-inline-start (left in horizontal LTR writing).
     * Most specific padding override on the inline-start side.
     * Maps to: --ds-quad-pis
     */
    pis: {
        type: 'space',
        var:  '--ds-quad-pis',
    },

    /**
     * pie — padding-inline-end (right in horizontal LTR writing).
     * Most specific padding override on the inline-end side.
     * Maps to: --ds-quad-pie
     */
    pie: {
        type: 'space',
        var:  '--ds-quad-pie',
    },


    /* ── Border ──────────────────────────────────────────────
       Same three-level resolution as padding.
       Accepts full CSS border shorthand values:
         "1px solid currentColor"
         "2px dashed var(--ds-color-accent)"
    ──────────────────────────────────────────────────────────── */

    /**
     * border — border on all four sides.
     * Accepts a full CSS border shorthand value.
     * Maps to: --ds-quad-border
     * @example <quadrilateral-layout border="1px solid currentColor">
     */
    border: {
        type: 'raw',
        var:  '--ds-quad-border',
    },

    /**
     * border-block — border on block-start and block-end sides.
     * Overrides `border` on the block axis.
     * Maps to: --ds-quad-border-block
     */
    'border-block': {
        type: 'raw',
        var:  '--ds-quad-border-block',
    },

    /**
     * border-inline — border on inline-start and inline-end sides.
     * Overrides `border` on the inline axis.
     * Maps to: --ds-quad-border-inline
     */
    'border-inline': {
        type: 'raw',
        var:  '--ds-quad-border-inline',
    },

    /**
     * border-bs — border-block-start (top border in horizontal LTR).
     * Most specific border override on the block-start side.
     * Maps to: --ds-quad-border-bs
     * @example <quadrilateral-layout border="1px solid #ccc" border-bs="2px solid red">
     */
    'border-bs': {
        type: 'raw',
        var:  '--ds-quad-border-bs',
    },

    /**
     * border-be — border-block-end (bottom border in horizontal LTR).
     * Maps to: --ds-quad-border-be
     */
    'border-be': {
        type: 'raw',
        var:  '--ds-quad-border-be',
    },

    /**
     * border-is — border-inline-start (left border in horizontal LTR).
     * Maps to: --ds-quad-border-is
     */
    'border-is': {
        type: 'raw',
        var:  '--ds-quad-border-is',
    },

    /**
     * border-ie — border-inline-end (right border in horizontal LTR).
     * Maps to: --ds-quad-border-ie
     */
    'border-ie': {
        type: 'raw',
        var:  '--ds-quad-border-ie',
    },


    /* ── Border radius ───────────────────────────────────────
       Corner names use CSS logical notation:
         ss = start-start  se = start-end
         es = end-start    ee = end-end

       In horizontal LTR writing:
         ss = top-left     se = top-right
         es = bottom-left  ee = bottom-right

       Accepts space tokens (xs, s, m, l …) for consistent rounding
       with the design system scale, or arbitrary CSS lengths.
    ──────────────────────────────────────────────────────────── */

    /**
     * radius — border-radius on all four corners.
     * Maps to: --ds-quad-radius
     * @example <quadrilateral-layout radius="s">
     * @example <quadrilateral-layout radius="9999px">  (pill shape)
     */
    radius: {
        type: 'space',
        var:  '--ds-quad-radius',
    },

    /**
     * radius-ss — border-start-start-radius (top-left in LTR).
     * Maps to: --ds-quad-radius-ss
     */
    'radius-ss': {
        type: 'space',
        var:  '--ds-quad-radius-ss',
    },

    /**
     * radius-se — border-start-end-radius (top-right in LTR).
     * Maps to: --ds-quad-radius-se
     */
    'radius-se': {
        type: 'space',
        var:  '--ds-quad-radius-se',
    },

    /**
     * radius-es — border-end-start-radius (bottom-left in LTR).
     * Maps to: --ds-quad-radius-es
     */
    'radius-es': {
        type: 'space',
        var:  '--ds-quad-radius-es',
    },

    /**
     * radius-ee — border-end-end-radius (bottom-right in LTR).
     * Maps to: --ds-quad-radius-ee
     */
    'radius-ee': {
        type: 'space',
        var:  '--ds-quad-radius-ee',
    },


    /* ── Surface ─────────────────────────────────────────────
    ──────────────────────────────────────────────────────────── */

    /**
     * bg — background of the element.
     * Accepts any CSS background value: color, gradient, image, etc.
     * Maps to: --ds-quad-bg
     * @example <quadrilateral-layout bg="var(--my-surface-color)">
     * @example <quadrilateral-layout bg="linear-gradient(to right, #f00, #00f)">
     */
    bg: {
        type: 'raw',
        var:  '--ds-quad-bg',
    },

    /**
     * fg — foreground (text) color of the element and its subtree.
     * Accepts any CSS color value.
     * Maps to: --ds-quad-fg
     * @example <quadrilateral-layout fg="var(--my-text-color)">
     */
    fg: {
        type: 'raw',
        var:  '--ds-quad-fg',
    },

    /**
     * shadow — box-shadow of the element.
     * Accepts any CSS box-shadow value, including multiple shadows.
     * Maps to: --ds-quad-shadow
     * @example <quadrilateral-layout shadow="0 2px 8px rgba(0,0,0,0.12)">
     * @example <quadrilateral-layout shadow="0 1px 2px #0002, 0 4px 16px #0001">
     */
    shadow: {
        type: 'raw',
        var:  '--ds-quad-shadow',
    },

});

/**
 * Registers the `<quadrilateral-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/quadrilateral';
 * define();
 */
export function define(): void {
    defineElement('quadrilateral-layout', QuadrilateralLayoutElement);
}
