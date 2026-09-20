"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useMotionTemplate } from "framer-motion";

/**
 * Animated gradient mesh + dot pattern + cursor-reactive spotlight.
 * Purely visual overlay; renders fixed inside a `relative` parent.
 */
export function HeroBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(50);
  const my = useMotionValue(30);
  const sx = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${sx}% ${sy}%, color-mix(in oklab, var(--color-primary) 22%, transparent), transparent 60%)`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mx.set(((e.clientX - r.left) / r.width) * 100);
      my.set(((e.clientY - r.top) / r.height) * 100);
    };
    el.addEventListener("pointermove", onMove);
    return () => el.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  return (
    <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Animated gradient mesh */}
      <div className="absolute inset-0 opacity-70">
        <motion.div
          className="absolute -top-1/3 left-1/2 h-[900px] w-[900px] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "conic-gradient(from 0deg, color-mix(in oklab, var(--color-primary) 55%, transparent), color-mix(in oklab, var(--color-accent) 45%, transparent), color-mix(in oklab, var(--color-primary) 55%, transparent))",
            opacity: 0.35,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-[-10%] top-[10%] h-[500px] w-[500px] rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--color-primary) 40%, transparent)" }}
          animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[-8%] bottom-[-10%] h-[420px] w-[420px] rounded-full blur-3xl"
          style={{ background: "color-mix(in oklab, var(--color-accent) 45%, transparent)" }}
          animate={{ x: [0, -30, 25, 0], y: [0, 20, -25, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(color-mix(in oklab, var(--color-foreground) 35%, transparent) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, black 40%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 40%, black 40%, transparent 75%)",
        }}
      />

      {/* Cursor-reactive spotlight */}
      <motion.div className="absolute inset-0" style={{ background: spotlight }} />

      {/* Bottom fade into page */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
    </div>
  );
}

/** Word-by-word blur-to-focus reveal. */
export function WordsReveal({
  text,
  className,
  delay = 0,
  highlight,
}: {
  text: string;
  className?: string;
  delay?: number;
  highlight?: string;
}) {
  const words = text.split(" ");
  return (
    <motion.h1
      className={className}
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.07, delayChildren: delay } } }}
    >
      {words.map((w, i) => {
        const isHi = highlight && w.replace(/[.,]/g, "") === highlight.replace(/[.,]/g, "");
        return (
          <motion.span
            key={i}
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: 14, filter: "blur(10px)" },
              show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            <span className={isHi ? "text-gradient-brand" : undefined}>{w}</span>
            {i < words.length - 1 && <span>&nbsp;</span>}
          </motion.span>
        );
      })}
    </motion.h1>
  );
}

/** Magnetic wrapper — pulls child toward the cursor while hovered. */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/** Hydration-safe wrapper: only mount FX after mount to avoid SSR mismatch. */
export function ClientOnlyFX({ children }: { children: ReactNode }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  if (!m) return null;
  return <>{children}</>;
}