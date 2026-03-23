/**
 * @design-system/layout — breakpoint-layout + at-breakpoint
 *
 * A viewport-breakpoint conditional rendering primitive.
 * An escape hatch for cases where intrinsic layout, container queries,
 * and fluid scaling cannot achieve the desired result.
 *
 * READ THIS FIRST — prefer intrinsic layout tools:
 *   1. split-layout (auto-switches at threshold)
 *   2. fluid-grid-layout (columns from minimum width)
 *   3. containment-layout (@container queries)
 *   4. split-pane-layout, scrolling-layout
 *   5. breakpoint-layout ← last resort
 *
 * This module defines two custom elements:
 *   <breakpoint-layout> — transparent container, manages children
 *   <at-breakpoint>     — a conditionally-rendered variant
 *
 * Usage:
 *   <!-- Show different markup at mobile vs desktop -->
 *   <breakpoint-layout>
 *     <at-breakpoint max="47.9375rem">
 *       <mobile-nav>…</mobile-nav>
 *     </at-breakpoint>
 *     <at-breakpoint min="48rem">
 *       <desktop-nav>…</desktop-nav>
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 *   <!-- Three ranges with tablet in the middle -->
 *   <breakpoint-layout>
 *     <at-breakpoint max="29.9375rem">
 *       <compact-layout>…</compact-layout>
 *     </at-breakpoint>
 *     <at-breakpoint min="30rem" max="63.9375rem">
 *       <standard-layout>…</standard-layout>
 *     </at-breakpoint>
 *     <at-breakpoint min="64rem">
 *       <wide-layout>…</wide-layout>
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 *   <!-- Orientation: show different content in portrait vs landscape -->
 *   <breakpoint-layout>
 *     <at-breakpoint orientation="portrait">
 *       <portrait-experience>…</portrait-experience>
 *     </at-breakpoint>
 *     <at-breakpoint orientation="landscape">
 *       <landscape-experience>…</landscape-experience>
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 *   <!-- Combining min/max with orientation -->
 *   <breakpoint-layout>
 *     <at-breakpoint max="47.9375rem" orientation="portrait">
 *       mobile portrait
 *     </at-breakpoint>
 *     <at-breakpoint max="47.9375rem" orientation="landscape">
 *       mobile landscape
 *     </at-breakpoint>
 *     <at-breakpoint min="48rem">
 *       desktop (any orientation)
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 *   <!-- Always-visible fallback (no conditions) -->
 *   <breakpoint-layout>
 *     <at-breakpoint min="60rem">
 *       wide-only content
 *     </at-breakpoint>
 *     <at-breakpoint>
 *       always shown (acts as the else branch)
 *     </at-breakpoint>
 *   </breakpoint-layout>
 *
 * NOTE ON LENGTH VALUES:
 * `min` and `max` accept raw CSS lengths: px, rem, em.
 * In media queries, `em` values are relative to the BROWSER DEFAULT
 * font size (16px), not the document root font size. This is the CSS
 * spec behavior for @media queries. 48em = 768px at browser defaults.
 *
 * CSS custom properties (var()) are NOT supported in media queries
 * (they are not resolved before the media query is evaluated). Use
 * explicit length values, not design token references.
 *
 * @module @design-system/layout/breakpoint
 */

import {
    defineElement,
    normalizeRaw,
} from '../core.js';


/* ── Types ───────────────────────────────────────────────────── */

/** Orientation values for the orientation attribute. */
export type BreakpointOrientation = 'any' | 'portrait' | 'landscape';


/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Builds a CSS media query string from min, max, and orientation values.
 *
 * @example
 * buildMediaQuery('48rem', undefined, 'any')        // '(min-width: 48rem)'
 * buildMediaQuery('30rem', '47.9375rem', 'any')     // '(min-width: 30rem) and (max-width: 47.9375rem)'
 * buildMediaQuery(undefined, undefined, 'portrait') // '(orientation: portrait)'
 * buildMediaQuery(undefined, undefined, 'any')      // 'all' (always matches)
 */
function buildMediaQuery(
    min:         string | null,
    max:         string | null,
    orientation: string | null,
): string {
    const parts: string[] = [];

    const minV = min?.trim();
    const maxV = max?.trim();
    const oriV = orientation?.trim();

    if (minV) parts.push(`(min-width: ${minV})`);
    if (maxV) parts.push(`(max-width: ${maxV})`);
    if (oriV && oriV !== 'any') parts.push(`(orientation: ${oriV})`);

    return parts.length > 0 ? parts.join(' and ') : 'all';
}


/* ── at-breakpoint element ───────────────────────────────────── */

/**
 * A conditionally rendered child of `<breakpoint-layout>`.
 *
 * Shown when its `min`, `max`, and `orientation` conditions are all met.
 * Hidden otherwise (display: none).
 *
 * Can also be used standalone (without a breakpoint-layout parent)
 * when you just want a single element that appears/disappears at a
 * viewport condition without an explicit alternative. However, the
 * progressive enhancement fallback (`breakpoint-layout:not(:defined)`)
 * only works when inside a breakpoint-layout container.
 */
export class AtBreakpointElement extends HTMLElement {

    static get observedAttributes(): string[] {
        return ['min', 'max', 'orientation'];
    }

    /** The active MediaQueryList, cleaned up on attribute change. */
    #mql: MediaQueryList | null = null;

    /** The bound listener, stored for cleanup. */
    #listener: ((e: MediaQueryListEvent) => void) | null = null;

    connectedCallback(): void {
        this.#bind();
    }

    disconnectedCallback(): void {
        this.#unbind();
    }

    attributeChangedCallback(): void {
        this.#bind();
    }

    /**
     * Evaluates the current media query and shows or hides this element.
     * Also sets up a reactive listener so the element responds to viewport changes.
     */
    #bind(): void {
        this.#unbind();

        const min = normalizeRaw(this.getAttribute('min'));
        const max = normalizeRaw(this.getAttribute('max'));
        const ori = normalizeRaw(this.getAttribute('orientation'));

        const query = buildMediaQuery(
            min || null,
            max || null,
            ori || null,
        );

        const mql = window.matchMedia(query);
        this.#mql = mql;

        // Apply immediately
        this.#applyMatch(mql.matches);

        // React to changes
        const listener = (e: MediaQueryListEvent): void => {
            this.#applyMatch(e.matches);
        };
        this.#listener = listener;

        // Use addEventListener for modern browsers (addListener is deprecated)
        if (mql.addEventListener) {
            mql.addEventListener('change', listener);
        } else {
            // Safari <14 fallback
            (mql as MediaQueryList & { addListener: (fn: unknown) => void })
                .addListener(listener);
        }
    }

    /**
     * Removes the MediaQueryList listener to prevent memory leaks.
     */
    #unbind(): void {
        if (this.#mql && this.#listener) {
            if (this.#mql.removeEventListener) {
                this.#mql.removeEventListener('change', this.#listener);
            } else {
                (this.#mql as MediaQueryList & { removeListener: (fn: unknown) => void })
                    .removeListener(this.#listener);
            }
        }
        this.#mql = null;
        this.#listener = null;
    }

    /**
     * Shows or hides the element based on whether the media query matches.
     *
     * display: none is used (not visibility: hidden) so that:
     *   - Hidden content is removed from the accessibility tree
     *   - Images inside hidden variants do not load
     *   - Tab order skips hidden content
     */
    #applyMatch(matches: boolean): void {
        if (matches) {
            this.style.removeProperty('display');
            // If the CSS default is `display: none` (from the stylesheet),
            // removing the inline display property restores that default.
            // We need to explicitly set `display: block` (or the appropriate
            // display value) to override the stylesheet's `display: none`.
            // We use `revert` if supported, falling back to `block`.
            if (this.style.display === 'none' || this.style.display === '') {
                this.style.display = 'block';
            }
        } else {
            this.style.display = 'none';
        }
    }

    /**
     * Whether this element is currently visible (its media query matches).
     */
    get isActive(): boolean {
        return this.#mql?.matches ?? false;
    }
}


/* ── breakpoint-layout element ───────────────────────────────── */

/**
 * Transparent container for at-breakpoint children.
 *
 * Uses `display: contents` — it has no box of its own. Children
 * participate directly in the parent layout context.
 *
 * The container itself is intentionally minimal. Its primary function
 * is semantic: grouping at-breakpoint variants and providing the
 * progressive enhancement CSS hook via `breakpoint-layout:not(:defined)`.
 *
 * The container does not enforce "only one child active at a time."
 * If multiple children have overlapping min/max ranges and are both
 * shown simultaneously, that is the author's responsibility to prevent.
 */
export class BreakpointLayoutElement extends HTMLElement {

    /**
     * Returns all direct `at-breakpoint` children.
     */
    get variants(): AtBreakpointElement[] {
        return Array.from(this.querySelectorAll(':scope > at-breakpoint'))
            .filter((el): el is AtBreakpointElement => el instanceof AtBreakpointElement);
    }

    /**
     * Returns the currently active (visible) at-breakpoint child(ren).
     */
    get activeVariants(): AtBreakpointElement[] {
        return this.variants.filter(v => v.isActive);
    }

}


/* ── Registration ─────────────────────────────────────────────── */

/**
 * Registers both `<breakpoint-layout>` and `<at-breakpoint>` custom elements.
 * Safe to call multiple times — skips registration if already defined.
 *
 * Both elements are registered together because at-breakpoint is designed
 * to be used as a child of breakpoint-layout.
 *
 * @example
 * import { define } from '@design-system/layout/breakpoint';
 * define();
 */
export function define(): void {
    defineElement('breakpoint-layout', BreakpointLayoutElement);
    defineElement('at-breakpoint',     AtBreakpointElement);
}
