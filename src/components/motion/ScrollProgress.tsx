import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin gradient progress bar pinned to the top of the viewport that reflects
 * how far the user has scrolled through the current page.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.35,
  });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] bg-gradient-to-r from-primary via-accent to-primary"
    />
  );
}