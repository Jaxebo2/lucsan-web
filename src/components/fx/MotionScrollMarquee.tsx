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
  /** Velocidad base en %/seg sobre el ancho de la fila. Negativo = izquierda. */
  baseVelocity?: number;
}

/**
 * MotionScrollMarquee — fila infinita de cards con scroll velocity + drag.
 * Estilo motion.dev scroll-velocity-linked-offset: cards con rotaciones
 * y offsets sutiles, loop continuo, acelera/invierte con el scroll.
 */
export default function MotionScrollMarquee({ items, baseVelocity = -3 }: Props) {
  const reduceMotion = useReducedMotion();
  // baseX se trata como porcentaje (-100 a 0 representa una vuelta).
  const baseX = useMotionValue(0);

  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 5], { clamp: false });

  // Repetimos 3x para tener buffer continuo; 3 copias → wrap a 1/3.
  const SETS = 3;
  const wrapMin = -100 / SETS;
  const wrapMax = 0;
  const x = useTransform(baseX, (v) => `${wrap(wrapMin, wrapMax, v)}%`);

  const directionFactor = useRef<number>(1);

  useAnimationFrame((_t, delta) => {
    if (reduceMotion) return;
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    // Si el scroll va hacia abajo aceleramos en la dirección base,
    // si va hacia arriba invertimos.
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  // 3 copias del array para el infinite loop
  const repeated = Array.from({ length: SETS }, () => items).flat();

  // Offset Y aleatorio pero estable por índice (-12 a +12 px)
  const yOffsetFor = (i: number) => {
    const seed = (i * 9301 + 49297) % 233280;
    return ((seed / 233280) - 0.5) * 24;
  };
  // Rotación sutil estable por índice (-3 a +3 deg)
  const rotFor = (i: number) => {
    const seed = (i * 7901 + 12345) % 99991;
    return ((seed / 99991) - 0.5) * 6;
  };

  return (
    <div className="relative w-full overflow-hidden py-8">
      <motion.div
        className="flex cursor-grab gap-6 select-none will-change-transform active:cursor-grabbing"
        style={{ x }}
        drag="x"
        dragConstraints={{ left: -100000, right: 100000 }}
        dragElastic={0}
        dragMomentum={false}
        onDrag={(_e, info) => {
          // Mientras arrastra, sumar el delta (en px) al baseX como porcentaje aproximado.
          // El factor 0.04 convierte px → % visual (depende del ancho del strip).
          baseX.set(baseX.get() + info.delta.x * 0.04);
        }}
      >
        {repeated.map((item, i) => (
          <a
            key={`${item.titulo}-${i}`}
            href={item.href}
            draggable={false}
            style={{ transform: `translateY(${yOffsetFor(i)}px) rotate(${rotFor(i)}deg)` }}
            className="group relative block aspect-[3/4] w-[260px] flex-none overflow-hidden rounded-2xl bg-brand-black shadow-xl shadow-brand-black/20 transition-transform duration-500 hover:!rotate-0 hover:!translate-y-0 md:w-[300px] lg:w-[340px]"
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
          </a>
        ))}
      </motion.div>
    </div>
  );
}
