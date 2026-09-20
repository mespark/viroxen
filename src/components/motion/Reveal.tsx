import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in seconds before the reveal starts. Useful for staggering. */
  delay?: number;
  /** Vertical offset in px. Defaults to 16. */
  y?: number;
  /** Duration in seconds. Defaults to 0.5. */
  duration?: number;
  /** Trigger every time the element enters the viewport, not just the first time. */
  repeat?: boolean;
  as?: "div" | "section" | "article" | "header" | "footer" | "li" | "span";
};

/**
 * Subtle scroll-reveal: gentle fade + short upward slide, 300–500ms ease-out.
 * Honors prefers-reduced-motion via <MotionConfig reducedMotion="user" /> at the root.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  duration = 0.45,
  repeat = false,
  as = "div",
}: RevealProps) {
  const MotionTag = motion[as] as typeof motion.div;
  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0 },
  };
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: !repeat, amount: 0.2, margin: "0px 0px -60px 0px" }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      variants={variants}
    >
      {children}
    </MotionTag>
  );
}

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Delay between children in seconds. Defaults to 0.08. */
  stagger?: number;
  /** Delay before the first child begins. Defaults to 0.05. */
  initialDelay?: number;
  as?: "div" | "section" | "ul" | "ol";
};

/**
 * Wraps a grid/list. Direct children should be <RevealItem>.
 * Cascades their reveal to feel intentional, not synchronised.
 */
export function RevealStagger({
  children,
  className,
  stagger = 0.08,
  initialDelay = 0.05,
  as = "div",
}: StaggerProps) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren: initialDelay },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
  duration = 0.45,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  y?: number;
  duration?: number;
  as?: "div" | "section" | "article" | "li" | "span";
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: { opacity: 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: [0.22, 1, 0.36, 1] },
        },
      }}
    >
      {children}
    </MotionTag>
  );
}
