import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  useReducedMotion,
  wrap,
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
  /** Velocidad base en px/s. */
  baseVelocity?: number;
}

/**
 * MotionScrollMarquee — fila horizontal de cards que se mueve sola,
 * acelera/invierte con la velocidad del scroll, y se puede arrastrar.
 * Inspirado en https://motion.dev/examples/react-scroll-velocity-linked-offset
 */
export default function MotionScrollMarquee({ items, baseVelocity = -2 }: Props) {
  const reduceMotion = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // Repetimos items 3x para tener buffer continuo
  const repeated = [...items, ...items, ...items];
  // El wrap funciona en porcentajes — cuando x llega a -33.333% (un tercio recorrido), volvemos a 0
  const x = useTransform(baseX, (v) => `${wrap(-33.333, 0, v)}%`);

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_t, delta) => {
    if (reduceMotion) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    // Si el scroll va hacia abajo (velocity > 0), aceleramos en la dirección base
    // Si va hacia arriba, invertimos
    if (velocityFactor.get() < 0) {
      directionFactor.current = -1;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = 1;
    }
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div className="relative w-full overflow-hidden">
      <motion.div
        className="flex cursor-grab gap-6 will-change-transform active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -10000, right: 10000 }}
        dragElastic={0.05}
        onDrag={(_e, info) => {
          // Mientras arrastra, aplicar offset adicional al baseX
          baseX.set(baseX.get() + info.delta.x * 0.5);
        }}
      >
        {repeated.map((item, i) => (
          <a
            key={`${item.titulo}-${i}`}
            href={item.href}
            draggable={false}
            className="group relative block aspect-[3/4] w-[260px] flex-none overflow-hidden rounded-2xl bg-brand-black md:w-[320px] lg:w-[380px]"
          >
            {item.imagen ? (
              <img
                src={item.imagen}
                alt={item.titulo}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-brand-black to-neutral-900" />
            )}
            {/* Overlay gradient para legibilidad del texto */}
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
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-neutral-50 text-brand-black transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 11L11 3M11 3H5M11 3V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </motion.div>
    </div>
  );
}
