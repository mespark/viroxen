import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Slow-rotating wireframe shield rendered behind the hero copy.
 * - Pure lines (transparent), brand-primary colored, blends with the grid background.
 * - Subtle cursor parallax; auto-rotates when idle.
 * - Honors prefers-reduced-motion (stops rotation, keeps static geometry).
 * - Client-only: the <Canvas> is gated behind a mounted flag so SSR does not
 *   try to instantiate WebGL.
 */

function ShieldGeometry() {
  // Build a stylised shield outline: rounded top, tapered bottom point.
  const shape = new THREE.Shape();
  const w = 1.1;
  const h = 1.45;
  shape.moveTo(0, h);
  shape.bezierCurveTo(w, h, w, h * 0.55, w, h * 0.15);
  shape.bezierCurveTo(w, -h * 0.55, w * 0.35, -h * 0.95, 0, -h);
  shape.bezierCurveTo(-w * 0.35, -h * 0.95, -w, -h * 0.55, -w, h * 0.15);
  shape.bezierCurveTo(-w, h * 0.55, -w, h, 0, h);
  return shape;
}

function Shield() {
  const group = useRef<THREE.Group>(null!);
  const mouse = useRef({ x: 0, y: 0 });
  const { size } = useThree();
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = () => (reduced.current = mq.matches);
    mq.addEventListener?.("change", onChange);
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  useFrame((state, delta) => {
    if (!group.current) return;
    const target = group.current;
    if (!reduced.current) {
      target.rotation.y += delta * 0.18;
    }
    // Subtle parallax tilt toward cursor
    const tx = mouse.current.x * 0.25;
    const ty = -mouse.current.y * 0.18;
    target.rotation.x += (ty - target.rotation.x) * 0.04;
    // Overlay the parallax on top of the auto-rotate by nudging z
    target.rotation.z += (tx * 0.08 - target.rotation.z) * 0.04;
  });

  // Read brand primary from CSS variable so it stays theme-aware.
  const [color, setColor] = useState("#7aa2ff");
  useEffect(() => {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary")
      .trim();
    if (raw) {
      // three.js accepts oklch via Color() in r165+; fall back to css color parser.
      try {
        const c = new THREE.Color();
        c.setStyle(raw);
        setColor(`#${c.getHexString()}`);
      } catch {
        /* keep default */
      }
    }
  }, []);

  const shape = shieldShapeMemo();
  const points = shape.getPoints(120).map((p) => new THREE.Vector3(p.x, p.y, 0));

  // Extrude a thin shield to draw edge lines through the depth.
  const extrudeGeo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 32,
  });
  extrudeGeo.center();
  const edges = new THREE.EdgesGeometry(extrudeGeo, 18);

  const outline = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={group} scale={size.width < 640 ? 0.85 : 1.05}>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={0.55} />
      </lineSegments>
      <line>
        <primitive object={outline} attach="geometry" />
        <lineBasicMaterial color={color} transparent opacity={0.75} />
      </line>
      {/* Concentric inner ring for depth */}
      <mesh scale={0.55}>
        <torusGeometry args={[0.9, 0.005, 8, 96]} />
        <meshBasicMaterial color={color} transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

let _shape: THREE.Shape | null = null;
function shieldShapeMemo() {
  if (!_shape) _shape = ShieldGeometry();
  return _shape;
}

export function HeroShield() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      aria-hidden="true"
    >
      <div className="h-[520px] w-[520px] opacity-[0.35] sm:h-[640px] sm:w-[640px]">
        <Canvas
          camera={{ position: [0, 0, 4.2], fov: 45 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
        >
          <Shield />
        </Canvas>
      </div>
    </div>
  );
}
