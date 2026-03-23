/**
 * @design-system/layout — sandwich-layout
 *
 * A three-child vertical grid. Places children at the block-start (top),
 * middle, and block-end (bottom) of the container. The middle takes all
 * remaining vertical space (1fr) by default; top and bottom shrink to
 * their content height (auto).
 *
 * Defaults to 100dvh minimum height — designed for full-page app shells
 * and full-viewport section compositions. Use min="0" to remove the
 * minimum height constraint.
 *
 * Usage:
 *   <!-- Full-page app shell -->
 *   <sandwich-layout>
 *     <header>…site header…</header>
 *     <main>…page content…</main>
 *     <footer>…site footer…</footer>
 *   </sandwich-layout>
 *
 *   <!-- Fixed-height header and footer, flexible main -->
 *   <sandwich-layout size-bs="64px" size-be="48px">
 *     <header>…</header>
 *     <main>…</main>
 *     <footer>…</footer>
 *   </sandwich-layout>
 *
 *   <!-- No minimum height (e.g. a card with header/body/footer) -->
 *   <sandwich-layout min="0">
 *     <div class="card-header">…</div>
 *     <div class="card-body">…</div>
 *     <div class="card-footer">…</div>
 *   </sandwich-layout>
 *
 *   <!-- Custom minimum height -->
 *   <sandwich-layout min="50dvh">
 *     <div></div>          ← empty top slot
 *     <centered-layout>…</centered-layout>
 *     <div></div>          ← empty bottom slot
 *   </sandwich-layout>
 *
 *   <!-- Nested: sandwich inside bookend for classic sidebar layout -->
 *   <bookend-layout size-is="240px">
 *     <nav>…sidebar…</nav>
 *     <sandwich-layout>
 *       <header>…</header>
 *       <main>…</main>
 *       <footer>…</footer>
 *     </sandwich-layout>
 *     <div></div>
 *   </bookend-layout>
 *
 * @module @design-system/layout/sandwich
 */

import {
    createDesignSystemLayoutElement,
    defineElement,
} from '../core.js';

/**
 * The custom element class for `<sandwich-layout>`.
 * Exported for advanced use (subclassing, instanceof checks).
 */
export const SandwichLayoutElement = createDesignSystemLayoutElement({

    /**
     * size-bs — height of the block-start (top) row.
     *
     * Accepts:
     *   Space tokens: tiny, xxxs, xxs, xs, s, m, l, xl, xxl, xxxl, huge,
     *   or adjacent pairs → resolved to var(--ds-space-<token>).
     *   CSS grid track sizes: auto, 1fr, 64px, 4rem, minmax(0, 10%), etc.
     *
     * Maps to: --ds-sandwich-size-bs
     * Default: auto (shrinks to content height)
     *
     * @example <sandwich-layout size-bs="64px">  ← fixed-height header
     * @example <sandwich-layout size-bs="l">     ← token-height header
     */
    'size-bs': {
        type: 'space',
        var:  '--ds-sandwich-size-bs',
    },

    /**
     * size-ml — height of the middle row.
     *
     * Accepts space tokens or any CSS grid track size.
     * Default: 1fr (expands to fill remaining vertical space).
     *
     * Maps to: --ds-sandwich-size-ml
     *
     * @example <sandwich-layout size-ml="50%">  ← middle takes exactly half
     */
    'size-ml': {
        type: 'space',
        var:  '--ds-sandwich-size-ml',
    },

    /**
     * size-be — height of the block-end (bottom) row.
     *
     * Accepts space tokens or any CSS grid track size.
     *
     * Maps to: --ds-sandwich-size-be
     * Default: auto (shrinks to content height)
     *
     * @example <sandwich-layout size-be="48px">  ← fixed-height footer
     */
    'size-be': {
        type: 'space',
        var:  '--ds-sandwich-size-be',
    },

    /**
     * min — minimum block size (height) of the entire sandwich.
     *
     * Accepts any CSS length or viewport unit. Common values:
     *   "0"      — no minimum height (card / compact layout use)
     *   "50dvh"  — half the dynamic viewport height
     *   "100dvh" — full dynamic viewport height (default behavior)
     *   "600px"  — fixed minimum
     *
     * The CSS uses progressive enhancement (@supports blocks) to default
     * to 100dvh on supporting browsers, falling back to 100svh then 100vh.
     * This attribute overrides all three fallbacks.
     *
     * Maps to: --ds-sandwich-min
     * Default: 100dvh (with progressive fallbacks to svh and vh)
     *
     * @example <sandwich-layout min="0">
     * @example <sandwich-layout min="50dvh">
     */
    min: {
        type: 'raw',
        var:  '--ds-sandwich-min',
    },

});

/**
 * Registers the `<sandwich-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/sandwich';
 * define();
 */
export function define(): void {
    defineElement('sandwich-layout', SandwichLayoutElement);
}
