// ============================================================
// VDOM — Virtual DOM
// Responsabilité : créer, rendre et mettre à jour le DOM
// ============================================================

// TODO Phase 2 : implémenter h(), render(), mount(), diff(), patch()

export function h(tag, attrs = {}, ...children) {
  // Crée un nœud virtuel (vnode)
}

export function render(vnode) {
  // Transforme un vnode en vrai élément DOM
}

export function mount(vnode, container) {
  // Injecte le DOM rendu dans le conteneur
}

export function diff(oldVnode, newVnode) {
  // Compare deux vnodes et retourne les patches nécessaires
}

export function patch(element, patches) {
  // Applique les patches sur le vrai DOM
}
