// ============================================================
// EVENTS — Système d'événements personnalisé
// ============================================================

const registry = {}

export function on(eventType, selector, handler) {

  if (!registry[eventType]) {
    registry[eventType] = []

    document.addEventListener(eventType, (event) => {
      for (const entry of registry[eventType]) {

        // CORRECTION : on vérifie que event.target est bien
        // un élément HTML avant d'appeler .matches()
        if (!(event.target instanceof Element)) {
          // Pour les événements custom (emit), on appelle
          // directement le handler sans vérifier le selector
          entry.handler(event)
          continue
        }

        if (event.target.matches(entry.selector) ||
            event.target.closest(entry.selector)) {
          entry.handler(event)
        }
      }
    })
  }

  registry[eventType].push({ selector, handler })
}

export function off(eventType, selector, handler) {
  if (!registry[eventType]) return

  registry[eventType] = registry[eventType].filter(
    entry => !(entry.selector === selector && entry.handler === handler)
  )
}

export function emit(eventType, payload = {}) {
  const event = new CustomEvent(eventType, {
    detail: payload,
    bubbles: true
  })
  document.dispatchEvent(event)
}
