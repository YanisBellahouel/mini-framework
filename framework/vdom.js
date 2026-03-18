// ============================================================
// VDOM — Virtual DOM
// ============================================================

export function h(tag, attrs = {}, ...children) {
  return {
    tag,
    attrs: attrs || {},
    children: children.flat()
  }
}

export function render(vnode) {
  if (typeof vnode === 'string' || typeof vnode === 'number') {
    return document.createTextNode(vnode)
  }

  const el = document.createElement(vnode.tag)

  for (const [key, value] of Object.entries(vnode.attrs || {})) {
    if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value)
    } else {
      el.setAttribute(key, value)
    }
  }

  for (const child of vnode.children || []) {
    el.appendChild(render(child))
  }

  return el
}

export function mount(vnode, container) {
  container.innerHTML = ''
  const el = render(vnode)
  container.appendChild(el)
  return el
}

export function diff(oldVnode, newVnode) {

  // Cas 1 : les deux n'existent pas → rien à faire
  if (oldVnode === undefined && newVnode === undefined) {
    return null
  }

  // Cas 2 : oldVnode existe mais newVnode non → supprimer
  if (newVnode === undefined) {
    return { type: 'REMOVE' }
  }

  // Cas 3 : oldVnode n'existe pas mais newVnode oui → ajouter
  if (oldVnode === undefined) {
    return { type: 'ADD', newVnode }
  }

  // Cas 4 : les deux sont du texte
  if (typeof oldVnode === 'string' || typeof newVnode === 'string') {
    if (oldVnode !== newVnode) {
      return { type: 'REPLACE', newVnode }
    }
    return null
  }

  // Cas 5 : le tag a changé → remplacer entièrement
  if (oldVnode.tag !== newVnode.tag) {
    return { type: 'REPLACE', newVnode }
  }

  // Cas 6 : même tag → comparer attributs et enfants
  return {
    type: 'UPDATE',
    attrPatches: diffAttrs(oldVnode.attrs, newVnode.attrs),
    childPatches: diffChildren(oldVnode.children, newVnode.children)
  }
}

function diffAttrs(oldAttrs = {}, newAttrs = {}) {
  const patches = []

  for (const [key, value] of Object.entries(newAttrs)) {
    if (oldAttrs[key] !== value) {
      patches.push({ type: 'SET_ATTR', key, value })
    }
  }

  for (const key of Object.keys(oldAttrs)) {
    if (!(key in newAttrs)) {
      patches.push({ type: 'REMOVE_ATTR', key })
    }
  }

  return patches
}

function diffChildren(oldChildren = [], newChildren = []) {
  const patches = []
  const max = Math.max(oldChildren.length, newChildren.length)

  for (let i = 0; i < max; i++) {
    patches.push(diff(oldChildren[i], newChildren[i]))
  }

  return patches
}

export function patch(el, patchObj) {
  if (!patchObj) return el

  // Supprimer le nœud
  if (patchObj.type === 'REMOVE') {
    if (el && el.parentNode) {
      el.parentNode.removeChild(el)
    }
    return null
  }

  // Ajouter un nouveau nœud
  if (patchObj.type === 'ADD') {
    const newEl = render(patchObj.newVnode)
    if (el && el.parentNode) {
      el.parentNode.appendChild(newEl)
    }
    return newEl
  }

  // Remplacer le nœud entièrement
  if (patchObj.type === 'REPLACE') {
    const newEl = render(patchObj.newVnode)
    if (el && el.parentNode) {
      el.parentNode.replaceChild(newEl, el)
    }
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
      if (childPatch) {
        if (childNodes[i]) {
          patch(childNodes[i], childPatch)
        } else if (childPatch.type === 'ADD' || childPatch.type === 'REPLACE') {
          el.appendChild(render(childPatch.newVnode))
        }
      }
    })
  }

  return el
}
