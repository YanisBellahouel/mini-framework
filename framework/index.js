// ============================================================
// INDEX — Point d'entrée du framework
// Responsabilité : exporter tous les modules
// ============================================================

export { h, render, mount, diff, patch } from './vdom.js'
export { on, off, emit }                 from './events.js'
export { createStore }                   from './store.js'
export { createRouter, navigate }        from './router.js'
