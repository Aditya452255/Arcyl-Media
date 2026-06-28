import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const fadeInUp = (element, options) => {
  return gsap.from(element, {
    opacity: 0,
    y: options?.y ?? 40,
    duration: options?.duration ?? 0.8,
    delay: options?.delay ?? 0,
    stagger: options?.stagger ?? 0,
    ease: "power3.out",
  });
};

export const fadeIn = (element, options) => {
  return gsap.from(element, {
    opacity: 0,
    duration: options?.duration ?? 0.8,
    delay: options?.delay ?? 0,
    ease: "power2.out",
  });
};

export const scaleIn = (element, options) => {
  return gsap.from(element, {
    opacity: 0,
    scale: options?.scale ?? 0.9,
    duration: options?.duration ?? 0.6,
    delay: options?.delay ?? 0,
    ease: "back.out(1.7)",
  });
};

export const slideInLeft = (element, options) => {
  return gsap.from(element, {
    opacity: 0,
    x: options?.x ?? -60,
    duration: options?.duration ?? 0.8,
    delay: options?.delay ?? 0,
    ease: "power3.out",
  });
};

export const slideInRight = (element, options) => {
  return gsap.from(element, {
    opacity: 0,
    x: options?.x ?? 60,
    duration: options?.duration ?? 0.8,
    delay: options?.delay ?? 0,
    ease: "power3.out",
  });
};

export const createScrollTrigger = (trigger, animation, options) => {
  return ScrollTrigger.create({
    trigger,
    start: options?.start ?? "top 85%",
    end: options?.end ?? "bottom 15%",
    toggleActions: options?.toggleActions ?? "play none none none",
    animation,
  });
};

export const staggerReveal = (elements, options) => {
  const tl = gsap.timeline({
    scrollTrigger: options?.trigger
      ? {
          trigger: options.trigger,
          start: "top 85%",
          toggleActions: "play none none none",
        }
      : undefined,
  });

  tl.from(elements, {
    opacity: 0,
    y: options?.y ?? 30,
    duration: options?.duration ?? 0.6,
    stagger: options?.stagger ?? 0.1,
    ease: "power3.out",
  });

  return tl;
};

export const parallax = (element, options) => {
  return gsap.to(element, {
    y: options?.y ?? -50,
    ease: "none",
    scrollTrigger: {
      trigger: element,
      start: "top bottom",
      end: "bottom top",
      scrub: options?.speed ?? 1,
    },
  });
};

// Premium Word-by-Word reveal variants for Framer Motion
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

export const wordVariants = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.2, 0.65, 0.3, 0.9],
    },
  },
};
