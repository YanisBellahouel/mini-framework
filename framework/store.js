// ============================================================
// STORE — Gestion de l'état global
// ============================================================
//
// Principe : une seule source de vérité pour toute l'app.
// On ne modifie JAMAIS le state directement, uniquement
// via des mutations. Quand le state change, tous les
// abonnés (subscribers) sont notifiés automatiquement.
// ============================================================

export function createStore({ state, mutations }) {

  // Liste des fonctions à appeler quand le state change
  const subscribers = []

  const store = {

    // --------------------------------------------------------
    // getState() — Retourne une copie du state actuel
    // --------------------------------------------------------
    // On retourne une copie pour éviter qu'on modifie
    // le state directement sans passer par commit()
    //
    getState() {
      return { ...state }
    },

    // --------------------------------------------------------
    // commit() — La seule façon de modifier le state
    // --------------------------------------------------------
    // mutationName : le nom de la mutation à appliquer
    // payload      : les données à passer à la mutation
    //
    commit(mutationName, payload) {

      // On vérifie que la mutation existe
      if (!mutations[mutationName]) {
        console.error(`Mutation "${mutationName}" n'existe pas`)
        return
      }

      // On applique la mutation sur le state
      mutations[mutationName](state, payload)

      // On notifie tous les abonnés que le state a changé
      subscribers.forEach(fn => fn(store.getState()))
    },

    // --------------------------------------------------------
    // subscribe() — S'abonner aux changements du state
    // --------------------------------------------------------
    // fn : fonction appelée à chaque changement du state
    //
    subscribe(fn) {
      subscribers.push(fn)
    }
  }

  return store
}
