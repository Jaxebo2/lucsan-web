import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

interface Item {
  numero: string;
  titulo: string;
  descripcion: string;
  entregables?: string[];
}

interface Props {
  items: Item[];
  variant?: 'light' | 'dark';
}

/**
 * MotionTimeline — timeline vertical con línea de progreso scroll-linked
 * (useScroll de Framer Motion) y items que entran con spring stagger.
 */
export default function MotionTimeline({ items, variant = 'light' }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const isDark = variant === 'dark';

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start 80%', 'end 30%'],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="relative">
      {/* Línea base */}
      <span
        className={`absolute left-7 top-0 h-full w-px md:left-10 ${
          isDark ? 'bg-neutral-700' : 'bg-border-default'
        }`}
        aria-hidden="true"
      />
      {/* Línea de progreso animada con scroll */}
      <motion.span
        style={{ height: reduceMotion ? '100%' : lineHeight }}
        className="absolute left-7 top-0 w-px bg-brand-coral md:left-10"
        aria-hidden="true"
      />

      <ol className="flex flex-col gap-16 md:gap-20">
        {items.map((item, i) => (
          <motion.li
            key={i}
            initial={reduceMotion ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: i * 0.08,
            }}
            className="group relative flex gap-6 md:gap-10"
          >
            {/* Marker */}
            <div className="relative flex-none">
              <motion.span
                whileHover={reduceMotion ? {} : { scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`flex h-14 w-14 items-center justify-center rounded-full border-2 font-display text-lg font-bold md:h-20 md:w-20 md:text-2xl ${
                  isDark
                    ? 'border-brand-coral bg-brand-black text-text-inverse'
                    : 'border-brand-coral bg-surface-page text-text-accent'
                }`}
              >
                {item.numero}
              </motion.span>
            </div>

            {/* Contenido */}
            <div className="flex-1 pt-2 md:pt-4">
              <p
                className={`mb-2 font-mono text-xs uppercase tracking-widest ${
                  isDark ? 'text-text-inverse-secondary' : 'text-text-muted'
                }`}
              >
                Fase {item.numero}
              </p>
              <h3
                className={`font-display text-3xl font-bold leading-tight tracking-tight transition-colors duration-300 group-hover:text-text-accent md:text-5xl ${
                  isDark ? 'text-text-inverse' : 'text-text-primary'
                }`}
              >
                {item.titulo}
              </h3>
              <p
                className={`mt-4 max-w-2xl text-base leading-relaxed md:text-lg ${
                  isDark ? 'text-text-inverse-secondary' : 'text-text-secondary'
                }`}
              >
                {item.descripcion}
              </p>

              {item.entregables && item.entregables.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {item.entregables.map((e) => (
                    <li
                      key={e}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${
                        isDark
                          ? 'border-neutral-700 bg-neutral-800/50 text-text-inverse'
                          : 'border-border-default bg-surface-elevated text-text-primary'
                      }`}
                    >
                      <span className="text-brand-coral">✓</span>
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}
