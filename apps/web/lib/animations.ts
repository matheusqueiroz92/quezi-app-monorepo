import gsap from "gsap";

/**
 * Configurações e utilitários de animações com GSAP
 */

// ========================================
// CONFIGURAÇÕES PADRÃO
// ========================================

// Ease padrão para animações suaves (Quezi style)
export const DEFAULT_EASE = "power2.out";
export const DEFAULT_DURATION = 0.3;

// ========================================
// ANIMAÇÕES DE ENTRADA (FADE IN)
// ========================================

/**
 * Fade in simples
 */
export function fadeIn(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade in de baixo para cima
 */
export function fadeInUp(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    y: 30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade in de cima para baixo
 */
export function fadeInDown(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    y: -30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade in da esquerda
 */
export function fadeInLeft(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    x: -30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade in da direita
 */
export function fadeInRight(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    x: 30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade in com escala (zoom in)
 */
export function fadeInScale(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    scale: 0.8,
    duration: DEFAULT_DURATION,
    ease: "back.out(1.7)",
    ...options,
  });
}

// ========================================
// ANIMAÇÕES DE SAÍDA (FADE OUT)
// ========================================

/**
 * Fade out simples
 */
export function fadeOut(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.to(element, {
    opacity: 0,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade out para baixo
 */
export function fadeOutDown(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.to(element, {
    opacity: 0,
    y: 30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

/**
 * Fade out para cima
 */
export function fadeOutUp(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.to(element, {
    opacity: 0,
    y: -30,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    ...options,
  });
}

// ========================================
// ANIMAÇÕES DE LISTA (STAGGER)
// ========================================

/**
 * Anima lista de elementos com delay entre eles
 */
export function staggerFadeIn(
  elements: HTMLElement[] | string,
  staggerDelay: number = 0.1,
  options?: gsap.TweenVars
) {
  return gsap.from(elements, {
    opacity: 0,
    y: 20,
    duration: DEFAULT_DURATION,
    ease: DEFAULT_EASE,
    stagger: staggerDelay,
    ...options,
  });
}

/**
 * Anima lista com efeito de escala
 */
export function staggerScale(
  elements: HTMLElement[] | string,
  staggerDelay: number = 0.1,
  options?: gsap.TweenVars
) {
  return gsap.from(elements, {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: "back.out(1.7)",
    stagger: staggerDelay,
    ...options,
  });
}

// ========================================
// ANIMAÇÕES DE HOVER
// ========================================

/**
 * Hover com leve elevação e escala
 */
export function hoverLift(element: HTMLElement | string) {
  const el =
    typeof element === "string" ? document.querySelector(element) : element;

  if (!el) return;

  el.addEventListener("mouseenter", () => {
    gsap.to(el, {
      y: -5,
      scale: 1.02,
      duration: 0.2,
      ease: "power1.out",
    });
  });

  el.addEventListener("mouseleave", () => {
    gsap.to(el, {
      y: 0,
      scale: 1,
      duration: 0.2,
      ease: "power1.out",
    });
  });
}

// ========================================
// ANIMAÇÕES PREMIUM (QUEZI STYLE)
// ========================================

/**
 * Animação de entrada premium com brilho dourado
 */
export function premiumEntrance(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  const tl = gsap.timeline();

  tl.from(element, {
    opacity: 0,
    scale: 0.8,
    duration: 0.5,
    ease: "back.out(1.7)",
    ...options,
  }).to(
    element,
    {
      boxShadow: "0 4px 20px 0 rgba(212, 175, 55, 0.3)",
      duration: 0.3,
    },
    "-=0.2"
  );

  return tl;
}

/**
 * Pulso sutil (para notificações)
 */
export function pulse(element: HTMLElement | string, options?: gsap.TweenVars) {
  return gsap.to(element, {
    scale: 1.05,
    duration: 0.6,
    ease: "sine.inOut",
    repeat: -1,
    yoyo: true,
    ...options,
  });
}

/**
 * Shake (para erros)
 */
export function shake(element: HTMLElement | string, intensity: number = 10) {
  return gsap.to(element, {
    x: intensity,
    duration: 0.1,
    ease: "power4.inOut",
    yoyo: true,
    repeat: 5,
  });
}

/**
 * Bounce (para sucesso)
 */
export function bounce(element: HTMLElement | string) {
  return gsap.to(element, {
    y: -10,
    duration: 0.3,
    ease: "power1.out",
    yoyo: true,
    repeat: 1,
  });
}

// ========================================
// ANIMAÇÕES DE LOADING
// ========================================

/**
 * Rotação infinita (para spinners)
 */
export function rotate(element: HTMLElement | string) {
  return gsap.to(element, {
    rotation: 360,
    duration: 1,
    ease: "linear",
    repeat: -1,
  });
}

/**
 * Pulse de loading (dots)
 */
export function loadingPulse(
  elements: HTMLElement[] | string,
  staggerDelay: number = 0.2
) {
  return gsap.to(elements, {
    opacity: 0.3,
    duration: 0.6,
    ease: "sine.inOut",
    stagger: {
      each: staggerDelay,
      repeat: -1,
      yoyo: true,
    },
  });
}

// ========================================
// ANIMAÇÕES DE SCROLL
// ========================================

/**
 * Reveal ao scroll (requer ScrollTrigger plugin)
 */
export function revealOnScroll(
  element: HTMLElement | string,
  options?: gsap.TweenVars
) {
  return gsap.from(element, {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: DEFAULT_EASE,
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      toggleActions: "play none none none",
    },
    ...options,
  });
}

// ========================================
// TIMELINE HELPERS
// ========================================

/**
 * Cria timeline com configurações padrão
 */
export function createTimeline(options?: gsap.TimelineVars) {
  return gsap.timeline({
    defaults: {
      duration: DEFAULT_DURATION,
      ease: DEFAULT_EASE,
    },
    ...options,
  });
}

/**
 * Animação de página inteira (page transition)
 */
export function pageTransition(
  elementOut: HTMLElement | string,
  elementIn: HTMLElement | string
) {
  const tl = createTimeline();

  tl.to(elementOut, {
    opacity: 0,
    y: -30,
    duration: 0.3,
  }).from(
    elementIn,
    {
      opacity: 0,
      y: 30,
      duration: 0.3,
    },
    "+=0.1"
  );

  return tl;
}

// ========================================
// KILL ANIMATIONS
// ========================================

/**
 * Para todas as animações de um elemento
 */
export function killAnimations(element: HTMLElement | string) {
  gsap.killTweensOf(element);
}

/**
 * Para todas as animações globais
 */
export function killAllAnimations() {
  gsap.killTweensOf("*");
}

// ========================================
// EXPORT GSAP
// ========================================

export { gsap };
export default gsap;
