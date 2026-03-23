/**
 * @design-system/layout — core.ts
 *
 * Utilities and the element factory shared by every layout module.
 * This file has no side effects — nothing is registered or defined
 * on import. Each layout module imports from here and exports its
 * own `define()` function.
 *
 * Usage — à la carte (recommended for bundlers, fully tree-shakeable):
 *   import { define as defineStacked }  from '@design-system/layout/stacked';
 *   import { define as defineCentered } from '@design-system/layout/centered';
 *   defineStacked();
 *   defineCentered();
 *
 * Usage — all at once (recommended for CDN / no-build consumers):
 *   import 'https://cdn.jsdelivr.net/npm/@design-system/layout@VERSION/dist/register-all.min.js';
 *
 * @module @design-system/layout
 */


/* ── Token name prefixes ─────────────────────────────────────
──────────────────────────────────────────────────────────── */
const SPACE_PREFIX = '--ds-space-' as const;
const TEXT_PREFIX  = '--ds-text-'  as const;


/* ── Token allowlists ────────────────────────────────────────
   IMPORTANT: normalizeSpaceLike and normalizeTextLike use these
   Sets, NOT isSafeToken, to decide whether a value is a design token.

   Why an allowlist instead of a regex:
   The previous isSafeToken regex matched any kebab-case word starting
   with a letter — including valid CSS keywords like `auto`, `none`,
   `inherit`, `normal`, and grid track keywords like `subgrid`.

   If any of those passed through normalizeSpaceLike they would be
   expanded to `var(--ds-space-auto)` etc., which are undefined custom
   properties. CSS custom properties that are defined but invalid are
   "guaranteed invalid at computed value time." Crucially, a var() whose
   custom property is defined-but-invalid does NOT fall back to the
   var()'s own fallback argument — the property using it instead reverts
   to its inherited or initial value. This is a silent failure mode with
   no browser error.

   The allowlist ensures only real design token names get expanded.
   Everything else — CSS keywords, fr values, calc(), minmax(), ch,
   vw, arbitrary lengths — passes through unchanged.

   Keep these Sets in sync with the scale definitions in core.css.
──────────────────────────────────────────────────────────── */

/**
 * All valid named values for space tokens (`--ds-space-*`).
 * Covers the 11-step scale, all forward/inverse adjacent pairs,
 * and the -inv suffixed inverse steps.
 */
export const SPACE_TOKENS = new Set<string>([
    /* The 11-step scale */
    'tiny', 'xxxs', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'huge',
    /* Forward adjacent pairs  (smaller → larger) */
    'tiny-xxxs', 'xxxs-xxs', 'xxs-xs', 'xs-s', 's-m', 'm-l', 'l-xl', 'xl-xxl', 'xxl-xxxl', 'xxxl-huge',
    /* Inverse adjacent pairs  (larger → smaller) */
    'xxxs-tiny', 'xxs-xxxs', 'xs-xxs', 's-xs', 'm-s', 'l-m', 'xl-l', 'xxl-xl', 'xxxl-xxl', 'huge-xxxl',
    /* Inverse suffixed steps */
    'tiny-inv', 'xxxs-inv', 'xxs-inv', 'xs-inv', 's-inv', 'm-inv',
    'l-inv', 'xl-inv', 'xxl-inv', 'xxxl-inv', 'huge-inv',
]);

/**
 * All valid named values for text tokens (`--ds-text-*`).
 */
export const TEXT_TOKENS = new Set<string>([
    'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl', 'huge',
]);

/**
 * All valid named values for z-index tokens (`--ds-z-*`).
 * Matches the semantic stacking context names defined in core.css.
 */
export const Z_TOKENS = new Set<string>([
    'base', 'raised', 'dropdown', 'sticky', 'overlay', 'modal', 'toast',
]);


/* ── Types ───────────────────────────────────────────────────
──────────────────────────────────────────────────────────── */

/**
 * How an attribute value is interpreted and normalized before
 * being applied as a CSS property.
 *
 * - `'space'`  — maps named space tokens to `--ds-space-*`; passes other values through
 * - `'text'`   — maps named text tokens to `--ds-text-*`;  passes other values through
 * - `'ratio'`  — normalizes `W/H` to `W / H` (CSS aspect-ratio syntax)
 * - `'number'`  — validates as integer or decimal; rejects non-numeric
 * - `'raw'`     — trims and passes through without transformation
 * - `'columns'` — integer → `repeat(N, 1fr)`; track list passes through
 * - `'rows'`    — integer → `repeat(N, auto)`; track list passes through
 */
export type AttrType = 'space' | 'text' | 'ratio' | 'number' | 'raw' | 'columns' | 'rows' | 'z-index';

/**
 * Descriptor for a single observed attribute on a layout element.
 * At least one of `var` or `prop` must be present.
 */
export interface AttrSpec {
    /** How to normalize the attribute value. */
    type: AttrType;
    /**
     * CSS custom property to set on the element's inline style.
     * e.g. `'--ds-stacked-gap'`
     */
    var?: string;
    /**
     * Regular CSS property to set on the element's inline style.
     * Rarely used; prefer `var` for layout tokens.
     * e.g. `'aspect-ratio'`
     */
    prop?: string;
}

/** The full attribute map passed to `createDesignSystemLayoutElement`. */
export type AttrMap = Record<string, AttrSpec>;


/* ── Validators ──────────────────────────────────────────────
──────────────────────────────────────────────────────────── */

/**
 * Returns true if the value is a safe kebab-case identifier.
 *
 * NOTE: This is intentionally NOT used in normalizeSpaceLike or
 * normalizeTextLike — see the SPACE_TOKENS/TEXT_TOKENS allowlist
 * comment above for why. Exported for modules that need a general
 * identifier check independent of the token lookup.
 */
export function isSafeToken(value: string): boolean {
    return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value);
}


/* ── Normalizers ─────────────────────────────────────────────
   Each normalizer converts a raw HTML attribute string into a
   CSS value ready to apply as an inline style property.

   Return value contract:
   - Non-empty string → apply this value
   - Empty string ""  → remove the property (let cascade provide a value)
──────────────────────────────────────────────────────────── */

/**
 * Normalizes a space-like attribute value.
 *
 * Named tokens in SPACE_TOKENS → `var(--ds-space-<token>)`.
 * `"0"` → `"0"` (literal zero; no var wrapper needed).
 * Everything else (CSS keywords, lengths, fr, calc, minmax, etc.)
 * → trimmed and passed through as raw CSS.
 * Absent / empty → `""` (removes the property).
 *
 * @example
 * normalizeSpaceLike('s-m')           // 'var(--ds-space-s-m)'
 * normalizeSpaceLike('xl')            // 'var(--ds-space-xl)'
 * normalizeSpaceLike('2rem')          // '2rem'
 * normalizeSpaceLike('0')             // '0'
 * normalizeSpaceLike('auto')          // 'auto'  ← passes through (NOT expanded)
 * normalizeSpaceLike('1fr')           // '1fr'   ← passes through for grid tracks
 * normalizeSpaceLike('minmax(0,1fr)') // 'minmax(0,1fr)'
 * normalizeSpaceLike(null)            // ''
 */
export function normalizeSpaceLike(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v)        return '';
    if (v === '0') return '0';
    if (SPACE_TOKENS.has(v)) return `var(${SPACE_PREFIX}${v})`;
    return v;
}

/**
 * Normalizes a text-size attribute value.
 *
 * Named tokens in TEXT_TOKENS → `var(--ds-text-<token>)`.
 * Everything else → trimmed and passed through.
 * Absent / empty → `""`.
 *
 * @example
 * normalizeTextLike('xl')       // 'var(--ds-text-xl)'
 * normalizeTextLike('1.25rem') // '1.25rem'
 * normalizeTextLike('inherit') // 'inherit' ← NOT expanded
 */
export function normalizeTextLike(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    if (TEXT_TOKENS.has(v)) return `var(${TEXT_PREFIX}${v})`;
    return v;
}

/**
 * Normalizes a ratio attribute value for CSS `aspect-ratio`.
 *
 * Slash-separated values are normalized to have spaces around the slash.
 * Other values are passed through. Absent / empty → `""`.
 *
 * @example
 * normalizeRatio('16/9')   // '16 / 9'
 * normalizeRatio('4 / 3') // '4 / 3'
 * normalizeRatio('1')     // '1'
 */
export function normalizeRatio(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    if (v.includes('/')) return v.replace(/\s*\/\s*/g, ' / ');
    return v;
}

/**
 * Normalizes a numeric attribute value.
 * Valid integers and decimals pass through; everything else → `""`.
 *
 * @example
 * normalizeNumber('3')    // '3'
 * normalizeNumber('-2')   // '-2'
 * normalizeNumber('abc') // ''
 */
export function normalizeNumber(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    return /^-?\d+(\.\d+)?$/.test(v) ? v : '';
}

/**
 * Normalizes a raw attribute value — just trims whitespace.
 * Use when the value is an arbitrary CSS value that needs no
 * token lookup or format transformation.
 */
export function normalizeRaw(value: string | null | undefined): string {
    return String(value ?? '').trim();
}

/**
 * Normalizes a z-index attribute value.
 *
 * - Named token in Z_TOKENS → resolved to `var(--ds-z-<token>)`
 *   e.g. 'overlay' → 'var(--ds-z-overlay)'
 * - 'auto' → passed through (valid CSS z-index keyword)
 * - Valid integer or decimal → passed through
 * - Empty/absent → '' (removes the property)
 * - Anything else → '' (rejected — not a valid z-index value)
 *
 * @example
 * normalizeZIndex('overlay')  // 'var(--ds-z-overlay)'
 * normalizeZIndex('modal')    // 'var(--ds-z-modal)'
 * normalizeZIndex('30')       // '30'
 * normalizeZIndex('auto')     // 'auto'
 * normalizeZIndex('high')     // ''   ← rejected
 * normalizeZIndex(null)        // ''
 */
export function normalizeZIndex(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    if (Z_TOKENS.has(v)) return `var(--ds-z-${v})`;
    if (v === 'auto') return v;
    if (/^-?\d+(\.\d+)?$/.test(v)) return v;
    return '';
}

/**
 * Normalizes a CSS grid column track specification.
 *
 * - Pure positive integer `"3"` → `"repeat(3, 1fr)"` (equal-width columns)
 * - Any other non-empty value → trimmed and passed through as raw CSS
 *   (accepts track lists: "1fr 2fr 1fr", "200px 1fr 200px", "auto 1fr", etc.)
 * - Absent / empty → `""` (removes the property)
 *
 * Used by modules where an integer column count is the common case but
 * a full CSS track list should also be accepted without extra syntax.
 *
 * @example
 * normalizeColumnTrack('3')            // 'repeat(3, 1fr)'
 * normalizeColumnTrack('1fr 2fr 1fr') // '1fr 2fr 1fr'
 * normalizeColumnTrack('auto 1fr')    // 'auto 1fr'
 * normalizeColumnTrack(null)           // ''
 */
export function normalizeColumnTrack(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    if (/^\d+$/.test(v)) return `repeat(${v}, 1fr)`;
    return v;
}

/**
 * Normalizes a CSS grid row track specification.
 *
 * - Pure positive integer `"3"` → `"repeat(3, auto)"` (auto-height rows)
 * - Any other non-empty value → trimmed and passed through as raw CSS
 *   (accepts track lists: "auto 1fr auto", "200px 1fr", "64px 1fr 48px", etc.)
 * - Absent / empty → `""` (removes the property)
 *
 * Rows default to `auto` (not `1fr`) because row height is typically driven
 * by content, not distributed free space — unlike columns where equal-width
 * distribution is usually the desired behavior.
 *
 * @example
 * normalizeRowTrack('3')              // 'repeat(3, auto)'
 * normalizeRowTrack('auto 1fr auto') // 'auto 1fr auto'
 * normalizeRowTrack('64px 1fr 48px') // '64px 1fr 48px'
 * normalizeRowTrack(null)             // ''
 */
export function normalizeRowTrack(value: string | null | undefined): string {
    const v = String(value ?? '').trim();
    if (!v) return '';
    if (/^\d+$/.test(v)) return `repeat(${v}, auto)`;
    return v;
}


/* ── DOM helpers ─────────────────────────────────────────────
──────────────────────────────────────────────────────────── */

/**
 * Sets or removes a CSS custom property on an element's inline style.
 * Passing `""` removes the property, letting the cascade take over.
 */
export function applyVar(el: HTMLElement, cssVarName: string, value: string): void {
    if (value === '') {
        el.style.removeProperty(cssVarName);
    } else {
        el.style.setProperty(cssVarName, value);
    }
}

/**
 * Sets or removes a regular CSS property on an element's inline style.
 * Prefer `applyVar` for token-driven styling.
 */
export function applyProp(el: HTMLElement, propName: string, value: string): void {
    if (value === '') {
        el.style.removeProperty(propName);
    } else {
        el.style.setProperty(propName, value);
    }
}

/**
 * Defines a custom element, safely skipping if already registered.
 * Guards against duplicate define() calls from HMR or multiple bundles.
 */
export function defineElement(tagName: string, elementClass: CustomElementConstructor): void {
    if (!customElements.get(tagName)) {
        customElements.define(tagName, elementClass);
    }
}


/* ── Element factory ─────────────────────────────────────────
──────────────────────────────────────────────────────────── */

/**
 * Creates a custom element class from a declarative attribute-to-CSS map.
 *
 * The returned class:
 * - Observes all keys in `varMap` as HTML attributes
 * - On connect and on any observed attribute change, normalizes each
 *   value and applies it as an inline CSS custom property (`spec.var`)
 *   and/or a regular CSS property (`spec.prop`) on the element itself
 * - Removing an attribute clears the inline property, falling back to
 *   whatever the stylesheet provides
 *
 * Boolean attributes that are handled purely by CSS attribute selectors
 * do NOT need entries in `varMap`. Only include an attribute here when
 * JS needs to react to its presence or value.
 *
 * All layout element tags follow the `<*-layout>` naming convention.
 *
 * @param varMap - Attribute → CSS spec mapping
 * @returns A class extending HTMLElement
 *
 * @example
 * const StackedLayoutElement = createDesignSystemLayoutElement({
 *   gap: { type: 'space', var: '--ds-stacked-gap' },
 * });
 * defineElement('stacked-layout', StackedLayoutElement);
 */
export function createDesignSystemLayoutElement(varMap: AttrMap): typeof HTMLElement {
    const entries = Object.entries(varMap);
    const attrs   = Object.keys(varMap);

    class DesignSystemLayoutElement extends HTMLElement {

        static get observedAttributes(): string[] {
            // Always observe 'vt-name' so any layout primitive can
            // participate in View Transitions by setting a unique name.
            return attrs.includes('vt-name') ? attrs : [...attrs, 'vt-name'];
        }

        connectedCallback(): void {
            this.#applyAll();
        }

        attributeChangedCallback(): void {
            this.#applyAll();
        }

        #applyAll(): void {
            for (const [attr, spec] of entries) {
                const raw   = this.getAttribute(attr);
                const value = raw === null ? '' : raw;

                let normalized: string;

                switch (spec.type) {
                    case 'space':   normalized = normalizeSpaceLike(value);    break;
                    case 'text':    normalized = normalizeTextLike(value);     break;
                    case 'ratio':   normalized = normalizeRatio(value);        break;
                    case 'number':  normalized = normalizeNumber(value);       break;
                    case 'z-index': normalized = normalizeZIndex(value);       break;
                    case 'columns': normalized = normalizeColumnTrack(value);  break;
                    case 'rows':    normalized = normalizeRowTrack(value);     break;
                    case 'raw':
                    default:        normalized = normalizeRaw(value);          break;
                }

                if (spec.var  !== undefined) applyVar(this,  spec.var,  normalized);
                if (spec.prop !== undefined) applyProp(this, spec.prop, normalized);
            }

            // Universal vt-name handling.
            // Any layout primitive can carry vt-name="my-unique-id" to
            // participate in a View Transitions sequence. The CSS rule
            // in ds.layout reads: view-transition-name: var(--ds-vt-name).
            // We bridge the attribute to the property here so the CSS
            // custom property substitution resolves to the developer's ident.
            const vtName = this.getAttribute('vt-name');
            applyVar(this, '--ds-vt-name', vtName === null ? '' : vtName.trim());
        }
    }

    return DesignSystemLayoutElement;
}
