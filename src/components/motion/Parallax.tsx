import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Pixel distance to travel across the scroll window. Positive = moves up. */
  offset?: number;
};

/**
 * Wraps children in a container that translates vertically as it passes
 * through the viewport. Purely decorative — safe with reduced-motion because
 * the transform amount is small and the browser respects the root MotionConfig.
 */
export function Parallax({ children, className, offset = 60 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, willChange: "transform" }}>{children}</motion.div>
    </div>
  );
}