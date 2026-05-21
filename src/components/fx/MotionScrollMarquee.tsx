import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  wrap,
  type MotionValue,
} from 'framer-motion';
import { useRef } from 'react';

interface Item {
  href: string;
  titulo: string;
  tag?: string;
  imagen?: string;
}

interface Props {
  items: Item[];
  /** Velocidad base en %/seg (negativo = izquierda) */
  baseVelocity?: number;
}

/**
 * MotionScrollMarquee — carousel 3D infinito.
 * Patrón motion.dev "scroll-velocity-linked-offset": cada card rota en Y
 * y traslada en Z según su posición relativa al centro, con la intensidad
 * del wave modulada por la velocidad del scroll. Drag (onPan) suma al baseX.
 */
export default function MotionScrollMarquee({ items, baseVelocity = -3 }: Props) {
  const reduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // waveIntensity sube cuando hay scroll y baja a 0 al detenerse — modula el 3D.
  const waveIntensity = useSpring(0, { damping: 22, stiffness: 180 });
  useMotionValueEvent(smoothVelocity, 'change', (v) => {
    waveIntensity.set(Math.min(Math.abs(v) / 800, 1));
  });

  const SETS = 3;
  const wrapMin = -100 / SETS;
  const x = useTransform(baseX, (v) => `${wrap(wrapMin, 0, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_t, delta) => {
    if (reduceMotion) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const repeated = Array.from({ length: SETS }, () => items).flat();

  return (
    <div
      className="marquee-3d relative w-full overflow-hidden py-12"
      style={{ perspective: '1400px' }}
    >
      <motion.div
        className="flex cursor-grab gap-8 select-none will-change-transform active:cursor-grabbing"
        style={{ x, transformStyle: 'preserve-3d' }}
        onPan={(_e, info) => {
          // Pan = drag horizontal. Convertimos delta px a % visual.
          baseX.set(baseX.get() + info.delta.x * 0.04);
        }}
      >
        {repeated.map((item, i) => (
          <Card3D
            key={`${item.titulo}-${i}`}
            item={item}
            index={i}
            total={repeated.length}
            baseX={baseX}
            waveIntensity={waveIntensity}
            wrapMin={wrapMin}
          />
        ))}
      </motion.div>
    </div>
  );
}

/* ────────────────────────── Card 3D ────────────────────────── */

interface CardProps {
  item: Item;
  index: number;
  total: number;
  baseX: MotionValue<number>;
  waveIntensity: MotionValue<number>;
  wrapMin: number;
}

function Card3D({ item, index, total, baseX, waveIntensity, wrapMin }: CardProps) {
  // Cada card tiene una "posición en el ciclo" — un % fijo donde estaría centrada.
  // Cuando baseX desplaza el strip, la posición visible de la card cambia.
  const cardPositionPercent = (index / total) * 100;

  // Distancia (en %) entre la card y el centro de la viewport (50% del strip)
  // wave normalizada entre -1 y 1 (sinusoide a lo largo del ciclo)
  const wavePhase = useTransform([baseX], (latest: number[]) => {
    const x = latest[0] ?? 0;
    // Posición efectiva = posición original + offset (con wrap)
    const wrapped = wrap(wrapMin, 0, x);
    const effective = cardPositionPercent + wrapped;
    // Normalizar a -1..1 a través del rango visible (-50..50 = una vuelta visible)
    return Math.sin((effective / 100) * Math.PI * 2);
  });

  // rotateY: ±18 grados según wave * intensity
  const rotateY = useTransform([wavePhase, waveIntensity], (latest: number[]) => {
    const phase = latest[0] ?? 0;
    const intensity = latest[1] ?? 0;
    return phase * 18 * (0.4 + intensity * 0.6);
  });

  // translateZ: ±60px (cards adelante/atrás)
  const translateZ = useTransform([wavePhase, waveIntensity], (latest: number[]) => {
    const phase = latest[0] ?? 0;
    const intensity = latest[1] ?? 0;
    return Math.cos(phase * Math.PI) * 60 * (0.3 + intensity * 0.7);
  });

  // translateY: oscila ±20px (efecto ola vertical)
  const translateY = useTransform([wavePhase, waveIntensity], (latest: number[]) => {
    const phase = latest[0] ?? 0;
    const intensity = latest[1] ?? 0;
    return phase * 20 * (0.3 + intensity * 0.7);
  });

  // Opacity sutil — cards "lejos" levemente más oscuras
  const opacity = useTransform(wavePhase, [-1, 0, 1], [0.85, 1, 0.85]);

  return (
    <motion.a
      href={item.href}
      draggable={false}
      style={{
        rotateY,
        z: translateZ,
        y: translateY,
        opacity,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ z: 100, transition: { type: 'spring', stiffness: 220, damping: 24 } }}
      className="group relative block aspect-[3/4] w-[260px] flex-none overflow-hidden rounded-2xl bg-brand-black shadow-2xl shadow-brand-black/30 md:w-[300px] lg:w-[340px]"
    >
      {item.imagen ? (
        <img
          src={item.imagen}
          alt={item.titulo}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-brand-black" />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/30 to-transparent" />

      {item.tag && (
        <span className="absolute left-4 top-4 inline-flex items-center rounded-full bg-brand-black/70 px-3 py-1 text-[10px] font-medium uppercase tracking-widest text-neutral-50 backdrop-blur">
          {item.tag}
        </span>
      )}
      <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
        <h3 className="font-display text-xl font-bold leading-tight text-neutral-50 md:text-2xl">
          {item.titulo}
        </h3>
        <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-neutral-50 text-brand-black transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 11L11 3M11 3H5M11 3V9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </div>
    </motion.a>
  );
}
