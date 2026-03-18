// ============================================================
// GAME LOOP — Boucle de jeu à 60fps
// ============================================================
//
// Principe : une game loop tourne en continu.
// À chaque frame elle fait deux choses dans l'ordre :
//   1. update() — met à jour la logique du jeu (positions,
//                 collisions, score, état des bombes...)
//   2. draw()   — redessine tout sur le canvas
//
// On utilise requestAnimationFrame() qui est synchronisé
// avec le taux de rafraîchissement de l'écran (60fps).
//
// Le "deltaTime" est le temps écoulé depuis la dernière frame
// (en secondes). On l'utilise pour que le jeu tourne à la
// même vitesse peu importe les performances de la machine.
// ============================================================

export function createGameLoop({ update, draw }) {

  let animationFrameId = null
  let lastTime = null
  let running = false

  // La fonction appelée à chaque frame par le navigateur
  function loop(timestamp) {
    if (!running) return

    // Calcul du deltaTime en secondes
    if (lastTime === null) lastTime = timestamp
    const deltaTime = (timestamp - lastTime) / 1000
    lastTime = timestamp

    // 1. Mettre à jour la logique
    update(deltaTime)

    // 2. Dessiner
    draw()

    // Demande la prochaine frame
    animationFrameId = requestAnimationFrame(loop)
  }

  return {

    // --------------------------------------------------------
    // start() — Démarre la boucle
    // --------------------------------------------------------
    start() {
      if (running) return
      running = true
      lastTime = null
      animationFrameId = requestAnimationFrame(loop)
      console.log('🎮 Game loop started')
    },

    // --------------------------------------------------------
    // stop() — Met en pause la boucle
    // --------------------------------------------------------
    stop() {
      running = false
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
      console.log('⏸️ Game loop stopped')
    },

    // --------------------------------------------------------
    // isRunning() — Retourne true si la boucle tourne
    // --------------------------------------------------------
    isRunning() {
      return running
    }
  }
}
