/**
 * @design-system/layout — register-all.ts
 *
 * Imports and immediately calls define() for every layout module.
 * This file IS a side effect — it registers all custom elements on
 * import. It is the intended entry point for CDN / no-build consumers.
 *
 * CDN usage:
 *   <script type="module"
 *     src="https://cdn.jsdelivr.net/npm/@design-system/layout@VERSION/dist/register-all.min.js">
 *   </script>
 *
 * Bundler consumers who want tree-shaking should NOT import this file.
 * Instead, import and call only the modules you use:
 *   import { define as defineStacked } from '@design-system/layout/stacked';
 *   defineStacked();
 *
 * This file grows as modules are added. Each new module gets one import
 * line and one define() call below.
 */

import { define as defineStacked }  from './stacked/stacked.js';
// import { define as defineCentered } from './centered/centered.js';
// import { define as defineCluster }  from './cluster/cluster.js';
// import { define as defineSplit }    from './split/split.js';
// … add imports here as modules are implemented

defineStacked();
// defineCentered();
// defineCluster();
// defineSplit();
// … add define() calls here in the same order
