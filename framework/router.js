// ============================================================
// ROUTER — Système de routing basé sur le hash
// ============================================================
//
// Principe : on écoute les changements de l'URL (la partie #).
// Quand l'URL change, on trouve la route correspondante
// et on appelle sa fonction pour afficher le bon contenu.
//
// Exemple :
//   monsite.com/#/        → affiche tous les todos
//   monsite.com/#/active  → affiche les todos actifs
// ============================================================

let currentRouter = null

export function createRouter(routes) {

  const router = {

    // --------------------------------------------------------
    // La liste des routes définies par l'utilisateur
    // Exemple : [{ path: '/', component: MaFonction }, ...]
    // --------------------------------------------------------
    routes,

    // --------------------------------------------------------
    // resolve() — Trouve et exécute la route correspondante
    // --------------------------------------------------------
    resolve() {
      // On récupère le hash de l'URL sans le #
      // ex: '#/active' → '/active'
      const hash = window.location.hash.slice(1) || '/'

      // On cherche la route qui correspond
      const route = routes.find(r => r.path === hash)

      if (route) {
        route.component()
      } else {
        // Route non trouvée : on va sur la route par défaut
        const defaultRoute = routes.find(r => r.path === '/')
        if (defaultRoute) defaultRoute.component()
      }
    },

    // --------------------------------------------------------
    // init() — Démarre le router
    // --------------------------------------------------------
    init() {
      // On écoute les changements de hash dans l'URL
      window.addEventListener('hashchange', () => {
        this.resolve()
      })

      // On résout la route au chargement initial de la page
      this.resolve()
    }
  }

  currentRouter = router
  return router
}

// --------------------------------------------------------
// navigate() — Change de route programmatiquement
// --------------------------------------------------------
export function navigate(path) {
  window.location.hash = path
}
