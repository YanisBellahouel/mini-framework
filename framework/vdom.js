// ============================================================
// VDOM — Virtual DOM
// ============================================================


// ----------------------------------------------------------
// h() — Crée un nœud virtuel (vnode)
// ----------------------------------------------------------
// Un vnode est un simple objet JS qui décrit un élément HTML
//
// Exemple :
//   h('div', { class: 'box' }, 'Bonjour')
//   → { tag: 'div', attrs: { class: 'box' }, children: ['Bonjour'] }
//
export function h(tag, attrs = {}, ...children) {
  return {
    tag,
    attrs: attrs || {},
    // children peut contenir des vnodes ou du texte brut
    // on aplatit les tableaux pour simplifier les listes
    children: children.flat()
  }
}


// ----------------------------------------------------------
// render() — Transforme un vnode en vrai élément DOM
// ----------------------------------------------------------
// Reçoit un vnode (objet JS) et retourne un vrai nœud HTML
//
export function render(vnode) {

  // Cas 1 : le vnode est du texte brut (ex: 'Bonjour')
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(vnode)
  }

  // Cas 2 : c'est un élément HTML classique
  const el = document.createElement(vnode.tag)

  // On applique chaque attribut sur l'élément
  for (const [key, value] of Object.entries(vnode.attrs || {})) {

    // Les événements : onClick, onInput, etc.
    // on les convertit en vrais event listeners
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase() // 'onClick' → 'click'
      el.addEventListener(eventName, value)
    } else {
      el.setAttribute(key, value)
    }
  }

  // On rend et attache chaque enfant récursivement
  for (const child of vnode.children || []) {
    el.appendChild(render(child))
  }

  return el
}


// ----------------------------------------------------------
// mount() — Injecte le DOM rendu dans un conteneur
// ----------------------------------------------------------
// container : l'élément HTML dans lequel on veut afficher
// vnode     : ce qu'on veut afficher
//
export function mount(vnode, container) {
  // On vide le conteneur
  container.innerHTML = ''
  // On construit le vrai DOM depuis le vnode
  const el = render(vnode)
  // On l'injecte dans la page
  container.appendChild(el)
  return el
}


// ----------------------------------------------------------
// diff() — Compare deux vnodes et retourne les différences
// ----------------------------------------------------------
// Retourne un objet "patch" qui décrit quoi changer
//
export function diff(oldVnode, newVnode) {

  // Cas 1 : le nouveau nœud n'existe plus → supprimer
  if (newVnode === undefined) {
    return { type: 'REMOVE' }
  }

  // Cas 2 : c'est du texte
  if (typeof oldVnode === 'string' || typeof newVnode === 'string') {
    if (oldVnode !== newVnode) {
      return { type: 'REPLACE', newVnode }
    }
    return null // rien à changer
  }

  // Cas 3 : le tag a changé (ex: div → span) → remplacer entièrement
  if (oldVnode.tag !== newVnode.tag) {
    return { type: 'REPLACE', newVnode }
  }

  // Cas 4 : même tag → on vérifie les attributs et les enfants
  return {
    type: 'UPDATE',
    attrPatches: diffAttrs(oldVnode.attrs, newVnode.attrs),
    childPatches: diffChildren(oldVnode.children, newVnode.children)
  }
}


// Compare les attributs entre l'ancien et le nouveau vnode
function diffAttrs(oldAttrs = {}, newAttrs = {}) {
  const patches = []

  // Attributs ajoutés ou modifiés
  for (const [key, value] of Object.entries(newAttrs)) {
    if (oldAttrs[key] !== value) {
      patches.push({ type: 'SET_ATTR', key, value })
    }
  }

  // Attributs supprimés
  for (const key of Object.keys(oldAttrs)) {
    if (!(key in newAttrs)) {
      patches.push({ type: 'REMOVE_ATTR', key })
    }
  }

  return patches
}


// Compare les enfants entre l'ancien et le nouveau vnode
function diffChildren(oldChildren = [], newChildren = []) {
  const patches = []
  const max = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < max; i++) {
    patches.push(diff(oldChildren[i], newChildren[i]))
  }

  return patches
}


// ----------------------------------------------------------
// patch() — Applique les changements sur le vrai DOM
// ----------------------------------------------------------
// el    : le vrai élément DOM à modifier
// patch : l'objet retourné par diff()
//
export function patch(el, patchObj) {

  if (!patchObj) return el // rien à faire

  // Supprimer le nœud
  if (patchObj.type === 'REMOVE') {
    el.parentNode.removeChild(el)
    return null
  }

  // Remplacer le nœud entièrement
  if (patchObj.type === 'REPLACE') {
    const newEl = render(patchObj.newVnode)
    el.parentNode.replaceChild(newEl, el)
    return newEl
  }

  // Mettre à jour attributs et enfants
  if (patchObj.type === 'UPDATE') {

    // Appliquer les changements d'attributs
    for (const attrPatch of patchObj.attrPatches) {
      if (attrPatch.type === 'SET_ATTR') {
        if (attrPatch.key.startsWith('on') && typeof attrPatch.value === 'function') {
          const eventName = attrPatch.key.slice(2).toLowerCase()
          el.addEventListener(eventName, attrPatch.value)
        } else {
          el.setAttribute(attrPatch.key, attrPatch.value)
        }
      }
      if (attrPatch.type === 'REMOVE_ATTR') {
        el.removeAttribute(attrPatch.key)
      }
    }

    // Appliquer les changements sur les enfants
    const childNodes = Array.from(el.childNodes)
    patchObj.childPatches.forEach((childPatch, i) => {
      if (childNodes[i]) {
        patch(childNodes[i], childPatch)
      } else if (childPatch && childPatch.type === 'REPLACE') {
        // Nouvel enfant à ajouter
        el.appendChild(render(childPatch.newVnode))
      }
    })
  }

  return el
}
