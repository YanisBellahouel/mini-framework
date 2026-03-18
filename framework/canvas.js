// ============================================================
// CANVAS — Abstraction de la surface de dessin 2D
// ============================================================
//
// Principe : on crée un <canvas> dans le conteneur voulu,
// et on expose des méthodes simples pour dessiner dessus.
//
// Tout le dessin passe par le "contexte 2D" du canvas (ctx).
// À chaque frame, on efface tout et on redessine depuis zéro.
// ============================================================

export function createCanvas({ containerId, width, height }) {

  // Crée l'élément <canvas> et l'injecte dans le conteneur
  const container = document.getElementById(containerId)
  const canvas = document.createElement('canvas')
  canvas.width  = width
  canvas.height = height
  container.appendChild(canvas)

  // Le contexte 2D — c'est lui qui sait dessiner
  const ctx = canvas.getContext('2d')

  return {

    // Référence brute au canvas et au contexte
    canvas,
    ctx,

    // --------------------------------------------------------
    // clear() — Efface tout le canvas
    // --------------------------------------------------------
    // À appeler au début de chaque frame
    //
    clear() {
      ctx.clearRect(0, 0, width, height)
    },

    // --------------------------------------------------------
    // drawRect() — Dessine un rectangle plein
    // --------------------------------------------------------
    // x, y        : position du coin supérieur gauche
    // w, h        : largeur et hauteur
    // color       : couleur CSS ('red', '#fff', etc.)
    //
    drawRect(x, y, w, h, color) {
      ctx.fillStyle = color
      ctx.fillRect(x, y, w, h)
    },

    // --------------------------------------------------------
    // drawImage() — Dessine une image ou un sprite
    // --------------------------------------------------------
    // image       : un objet Image() déjà chargé
    // sx, sy      : position dans le spritesheet source
    // sw, sh      : taille dans le spritesheet source
    // dx, dy      : position sur le canvas
    // dw, dh      : taille affichée sur le canvas
    //
    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
      ctx.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh)
    },

    // --------------------------------------------------------
    // drawText() — Écrit du texte sur le canvas
    // --------------------------------------------------------
    drawText(text, x, y, { color = '#fff', font = '16px Arial' } = {}) {
      ctx.fillStyle = color
      ctx.font = font
      ctx.fillText(text, x, y)
    },

    // --------------------------------------------------------
    // drawCircle() — Dessine un cercle plein
    // --------------------------------------------------------
    drawCircle(x, y, radius, color) {
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, Math.PI * 2)
      ctx.fill()
    },

    // --------------------------------------------------------
    // setBackground() — Remplit le fond d'une couleur
    // --------------------------------------------------------
    setBackground(color) {
      ctx.fillStyle = color
      ctx.fillRect(0, 0, width, height)
    }
  }
}
