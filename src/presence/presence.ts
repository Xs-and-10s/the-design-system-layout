/**
 * @design-system/layout — presence-layout
 *
 * A visibility management wrapper with an animated 3-step state machine
 * (absent ↔ invisible ↔ visible), exponential easing, and View Transitions
 * API integration.
 *
 * The element is BEHAVIORLESS by default — state is driven by setting
 * `data-state` from your application layer (Datastar signals, React state,
 * vanilla JS). The JS element adds devtools recognition, event dispatch,
 * and the orchestrated transition methods.
 *
 * ── THE 3-STEP STATE MACHINE ─────────────────────────────────
 *
 *   absent      display: none       not in layout or a11y tree
 *      ↕ (discrete transition or instant)
 *   invisible   visibility: hidden  in layout, not painted
 *      ↕ (opacity + transform transition)
 *   visible     fully painted       in layout, accessible
 *
 *   hidden = absent (semantic alias: "I'm hiding this" vs "this isn't here")
 *
 * Why 3 steps?
 *   You cannot animate `display: none → display: block` in one step without
 *   the element jumping into existence (or out of existence) visually. The
 *   `invisible` step is the bridge:
 *     - Going in:  absent → invisible (instant) → visible (animated)
 *     - Going out: visible → invisible (animated) → absent (instant)
 *   The JS orchestration methods (.show(), .hide(), .transitionTo()) handle
 *   this automatically. Direct `data-state` manipulation bypasses it.
 *
 * ── SCALE TOKEN ─────────────────────────────────────────
 *
 * --ds-presence-scale-from (default: 0.85) controls the scale value
 * at the start of entry (and end of exit). Set on the element or :root:
 *   0.85   subtle, professional (iOS-style)   ← default
 *   0      "scale to a literal point"          (dramatic, app-like)
 *   0.95   barely perceptible                  (tooltips, menus)
 *   1      no scale; pure opacity + translate
 *
 * ── USAGE ────────────────────────────────────────────────────
 *
 *   <!-- Simplest: CSS-driven state -->
 *   <presence-layout box animate="entry" data-state="absent">
 *     <dialog>…</dialog>
 *   </presence-layout>
 *
 *   // JS: animated 3-step reveal
 *   const el = document.querySelector('presence-layout');
 *   await el.show();         // absent → invisible → visible
 *   await el.hide();         // visible → invisible → absent
 *
 *   // JS: with View Transition (if API available, falls back gracefully)
 *   await el.transitionTo('visible');
 *
 *   <!-- View transition hook (unique name required) -->
 *   <presence-layout box vt-name="hero-panel">
 *     <section>…</section>
 *   </presence-layout>
 *   <!-- In your CSS: -->
 *   <!-- ::view-transition-old(hero-panel) { animation: ds-presence-fade-out … } -->
 *   <!-- ::view-transition-new(hero-panel) { animation: ds-presence-fade-in … } -->
 *
 *   <!-- Any layout primitive can also carry vt-name -->
 *   <region-layout vt-name="about-section">…</region-layout>
 *   <columns-layout vt-name="product-grid" cols="3">…</columns-layout>
 *
 * ── VIEW TRANSITIONS ON ANY LAYOUT PRIMITIVE ─────────────────
 *
 * The factory in core.ts universally observes `vt-name` on every layout
 * element and sets `--ds-vt-name` as an inline custom property. The CSS
 * rule in ds.layout reads `view-transition-name: var(--ds-vt-name)`.
 *
 * So: add vt-name="my-unique-id" to ANY layout primitive to make it a
 * named view transition participant. Wrap DOM changes in:
 *   document.startViewTransition(() => { /* your DOM change *\/ })
 *
 * Requirements:
 *   1. Each element's vt-name must be UNIQUE in the document.
 *   2. Elements with display: contents (presence-layout without [box])
 *      cannot receive view-transition-name — add [box].
 *   3. document.startViewTransition() must be called by your code.
 *      The library never calls it automatically (it doesn't know when
 *      you want a transition vs. a side-effect state change).
 *
 * @module @design-system/layout/presence
 */

import {
    defineElement,
    normalizeRaw,
    applyVar,
} from '../core.js';


/* ── Types ───────────────────────────────────────────────────── */

/** The four visibility states managed by presence-layout. */
export type PresenceState = 'visible' | 'invisible' | 'hidden' | 'absent';

/** Event detail for the `ds:presence` custom event. */
export interface PresenceChangeDetail {
    /** The current state after the change. */
    state: PresenceState;
    /** The previous state. Null on first observation. */
    previous: PresenceState | null;
}

/** The `ds:presence` event type. */
export type PresenceChangeEvent = CustomEvent<PresenceChangeDetail>;

/** View Transition API — TypeScript's lib.dom doesn't include it yet. */
interface ViewTransition {
    readonly finished: Promise<void>;
    readonly ready: Promise<void>;
    readonly updateCallbackDone: Promise<void>;
    skipTransition(): void;
}

declare global {
    interface Document {
        startViewTransition?(callback: () => void | Promise<void>): ViewTransition;
    }
}


/* ── Helpers ─────────────────────────────────────────────────── */

/**
 * Returns true if the element has [animate~="entry"] set.
 * Only when entry animations are opted into does the JS need to
 * orchestrate the intermediate invisible step.
 */
function hasEntryAnimation(el: HTMLElement): boolean {
    const animate = el.getAttribute('animate') ?? '';
    return animate.split(/\s+/).includes('entry');
}

/**
 * Waits for the next two animation frames, ensuring the browser has
 * had a chance to apply a style change before the next one fires.
 * (One rAF is enough in most browsers; two is defensive.)
 */
function nextFrames(): Promise<void> {
    return new Promise(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
}

/**
 * Returns a Promise that resolves when all `transitionend` events have
 * fired on the element (debounced 20ms), or after `maxWait` ms.
 *
 * WHY DEBOUNCE: When multiple CSS properties transition simultaneously
 * (opacity, transform, visibility), `transitionend` fires once per
 * property. Resolving on the first event means remaining transitions are
 * still in-flight when we proceed — setting `data-state="absent"` while
 * a transform transition runs can cause a brief flash because
 * `allow-discrete` holds `display: block` for the transition duration.
 * Debouncing waits until all properties have genuinely completed.
 */
function transitionEnd(el: HTMLElement, maxWait = 600): Promise<void> {
    return new Promise(resolve => {
        let debounceTimer: ReturnType<typeof setTimeout>;
        const guard = setTimeout(() => {
            el.removeEventListener('transitionend', onEnd);
            resolve();
        }, maxWait);

        const onEnd = (): void => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                clearTimeout(guard);
                el.removeEventListener('transitionend', onEnd);
                resolve();
            }, 20);
        };

        el.addEventListener('transitionend', onEnd);
    });
}


/* ── Element ─────────────────────────────────────────────────── */

/**
 * Custom element for `<presence-layout>`.
 *
 * A full custom class (not factory-generated) because it:
 * 1. Observes `data-state` (a data attribute, outside the varMap pattern)
 * 2. Dispatches `ds:presence` events on every state change
 * 3. Bridges `vt-name` → `--ds-vt-name` (same as the factory does,
 *    reimplemented here since this is a full class, not factory-built)
 * 4. Provides .show() / .hide() / .transitionTo() orchestration methods
 */
export class PresenceLayoutElement extends HTMLElement {

    static get observedAttributes(): string[] {
        return ['data-state', 'vt-name'];
    }

    connectedCallback(): void {
        this.#applyVtName();
    }

    attributeChangedCallback(
        name: string,
        oldValue: string | null,
        newValue: string | null,
    ): void {
        if (name === 'data-state') {
            this.#dispatchPresenceEvent(oldValue, newValue);
        } else if (name === 'vt-name') {
            this.#applyVtName();
        }
    }


    /* ── State getter / setter ───────────────────────────────
       The setter is DIRECT — no orchestration, no side effects.
       It simply sets data-state, which triggers attributeChangedCallback.
       Use .show(), .hide(), and .transitionTo() for orchestrated
       animated transitions.
    ──────────────────────────────────────────────────────────── */

    /** The current visibility state. Returns 'visible' when data-state is absent. */
    get state(): PresenceState {
        return this.#normalizeState(this.getAttribute('data-state'));
    }

    /**
     * Sets data-state directly, without orchestration.
     * The ds:presence event fires via attributeChangedCallback.
     * For animated 3-step transitions, use .show() / .hide() instead.
     */
    set state(value: PresenceState) {
        this.setAttribute('data-state', value);
    }


    /* ── Orchestrated transition methods ─────────────────────
       These methods handle the 3-step state machine automatically:
         show:  absent/hidden → invisible → visible
         hide:  visible → invisible → absent

       Both respect the [animate~="entry"] attribute. If entry animation
       is not opted into, they perform a direct state change.
    ──────────────────────────────────────────────────────────── */

    /**
     * Animated entry: absent/hidden → invisible → visible.
     *
     * Step 1: Set data-state="invisible" (removes display: none,
     *         element enters layout at opacity 0)
     * Step 2: After two rAFs (browser paints the invisible state),
     *         set data-state="visible" (transition fires)
     *
     * Without entry animation ([animate~="entry"] absent):
     *   Sets data-state="visible" directly.
     *
     * Returns a Promise that resolves when the transition completes.
     * Safe to call when already visible — no-op.
     */
    async show(): Promise<void> {
        if (this.state === 'visible') return;

        if (!hasEntryAnimation(this)) {
            this.state = 'visible';
            return;
        }

        // Step 1: remove display:none by moving to invisible
        if (this.state === 'absent' || this.state === 'hidden') {
            this.state = 'invisible';
            // Wait two frames so the browser paints the invisible state
            // before we trigger the transition to visible
            await nextFrames();
        }

        // Step 2: transition to visible
        this.state = 'visible';
        await transitionEnd(this);
    }

    /**
     * Animated exit: visible → invisible → absent.
     *
     * Step 1: Set data-state="invisible" (transition fires: fades out)
     * Step 2: After transitionend, set data-state="absent" (display: none)
     *
     * Without entry animation ([animate~="entry"] absent):
     *   Sets data-state="absent" directly.
     *
     * Returns a Promise that resolves when the element is display: none.
     * Safe to call when already absent — no-op.
     */
    async hide(to: 'absent' | 'hidden' = 'absent'): Promise<void> {
        if (this.state === 'absent' || this.state === 'hidden') return;

        if (!hasEntryAnimation(this)) {
            this.state = to;
            return;
        }

        // Step 1: animate to invisible (scale + fade out)
        this.state = 'invisible';
        await transitionEnd(this);

        // Step 2: suppress transitions before applying display: none.
        //
        // The element is already visually gone (opacity: 0, scale(0.88)).
        // Setting data-state="absent" with active transitions can cause a
        // brief flash: allow-discrete holds display: block for the full
        // transition duration while the browser re-evaluates property values,
        // potentially landing on an intermediate or initial-style state.
        //
        // Since the element is already invisible, the absent step is pure
        // DOM bookkeeping — no animation is needed. Slam it immediately.
        this.style.setProperty('transition', 'none');
        this.style.setProperty('transition-duration', '0s');
        // `transition: none` does NOT reset `transition-behavior` in all browsers
        // — it is not yet universally part of the transition shorthand.
        // If allow-discrete survives, the browser runs an exit animation for
        // display: block → none and briefly renders at initial computed values
        // (opacity:1, transform:none) — the full-size flash.
        // Setting transition-behavior: normal explicitly overrides the stylesheet
        // rule as a direct longhand and kills allow-discrete for this step.
        this.style.setProperty('transition-behavior', 'normal');
        this.state = to;

        // Use setTimeout (not requestAnimationFrame) for cleanup.
        // rAF fires BEFORE paint in the browser pipeline (JS → rAF → Style → Paint),
        // meaning rAF would remove the suppression before display:none is rendered,
        // potentially allowing a stale transition frame to appear.
        // setTimeout(fn, 0) fires in the NEXT task, after painting — guaranteed safe.
        setTimeout(() => {
            this.style.removeProperty('transition');
            this.style.removeProperty('transition-duration');
            this.style.removeProperty('transition-behavior');
        }, 0);
    }


    /* ── View Transition integration ─────────────────────────
       .transitionTo() wraps the orchestrated state change in
       document.startViewTransition() when the API is available.

       When wrapped in a view transition:
         - Elements with vt-name set on themselves or ancestor layout
           primitives get captured and cross-faded
         - The presence-layout's own opacity/transform animation and the
           view transition run simultaneously — the one that looks better
           wins (the view transition captures the old state BEFORE the
           CSS transition fires, so they don't conflict)

       Falls back to .show() / .hide() / direct state change when
       startViewTransition is not available (all non-Chromium browsers
       before Baseline 2025).
    ──────────────────────────────────────────────────────────── */

    /**
     * Transitions to a new state, wrapping in document.startViewTransition()
     * if the View Transitions API is available.
     *
     * For 'visible': uses .show() (3-step orchestration).
     * For 'absent'/'hidden': uses .hide() (3-step orchestration).
     * For 'invisible': direct state change (visibility: hidden is instant).
     *
     * @param state - Target PresenceState
     * @param useViewTransition - Force-disable VT even when API is available.
     *   Defaults to true (use VT when available).
     *
     * @example
     * // Show with view transition if supported
     * await presenceEl.transitionTo('visible');
     *
     * // Show without view transition
     * await presenceEl.transitionTo('visible', false);
     */
    async transitionTo(
        state: PresenceState,
        useViewTransition = true,
    ): Promise<void> {
        const canVT = useViewTransition && typeof document.startViewTransition === 'function';

        if (!canVT) {
            return this.#directTransition(state);
        }

        // Wrap the DOM state change in a view transition.
        // startViewTransition captures the OLD state, then calls the
        // callback to apply the NEW state, then animates between them.
        const transition = document.startViewTransition!(
            () => this.#directTransition(state)
        );

        await transition.finished;
    }

    /**
     * Performs the appropriate state transition without view transition wrapping.
     */
    async #directTransition(state: PresenceState): Promise<void> {
        if (state === 'visible') {
            return this.show();
        } else if (state === 'absent' || state === 'hidden') {
            return this.hide(state);
        } else {
            this.state = state;
        }
    }


    /* ── Event dispatch ──────────────────────────────────────── */

    #dispatchPresenceEvent(
        oldRaw: string | null,
        newRaw: string | null,
    ): void {
        const next     = this.#normalizeState(newRaw);
        const previous = oldRaw === null ? null : this.#normalizeState(oldRaw);

        this.dispatchEvent(
            new CustomEvent<PresenceChangeDetail>('ds:presence', {
                bubbles:  true,
                composed: true,
                detail: { state: next, previous },
            })
        );
    }

    #normalizeState(raw: string | null): PresenceState {
        if (
            raw === 'invisible' ||
            raw === 'hidden'    ||
            raw === 'absent'
        ) {
            return raw;
        }
        return 'visible';
    }


    /* ── vt-name bridge ──────────────────────────────────────── */

    /**
     * Bridges vt-name → --ds-vt-name for the CSS view-transition-name rule.
     * (Same mechanism as the factory, reimplemented here for the full class.)
     *
     * Note: view-transition-name has no effect on display: contents elements.
     * Add [box] to presence-layout when using vt-name.
     */
    #applyVtName(): void {
        const raw = this.getAttribute('vt-name');
        applyVar(this, '--ds-vt-name', normalizeRaw(raw));
    }
}


/* ── Registration ─────────────────────────────────────────────── */

/**
 * Registers the `<presence-layout>` custom element.
 * Safe to call multiple times — skips registration if already defined.
 *
 * @example
 * import { define } from '@design-system/layout/presence';
 * define();
 */
export function define(): void {
    defineElement('presence-layout', PresenceLayoutElement);
}
