import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

interface Panel {
  titulo: string;
  descripcion: string;
}

interface Props {
  panels: Panel[];
}

/**
 * MotionAccordion — horizontal accordion con spring overshoot (bounce) y
 * descripción que aparece sin saltar el título.
 */
export default function MotionAccordion({ panels }: Props) {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();

  // Spring con overshoot para sensación de "bounce" al final
  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 220, damping: 18, mass: 1 };

  return (
    <div className="flex flex-col gap-3 md:h-[440px] md:flex-row md:gap-3">
      {panels.map((panel, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={i}
            type="button"
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            aria-expanded={isActive}
            initial={false}
            animate={{ flexGrow: isActive ? 4 : 1 }}
            transition={transition}
            className="motion-accordion__panel group relative overflow-hidden rounded-2xl bg-brand-black text-left"
            style={{ flexBasis: 0, minHeight: 220 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-coral/40 via-brand-coral/10 to-brand-black" />
            <motion.div
              className="absolute inset-0 bg-brand-black"
              animate={{ opacity: isActive ? 0.25 : 0.55 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />

            <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs uppercase tracking-widest text-neutral-50/70">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Bottom: título + descripción.
                  La descripción tiene espacio reservado (max-height fija),
                  solo se anima opacity + translateY. Esto evita que el título
                  salte cuando aparece/desaparece. */}
              <div>
                <h3 className="font-display text-2xl font-bold leading-tight text-neutral-50 md:text-3xl">
                  {panel.titulo}
                </h3>
                <motion.p
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0,
                    y: isActive ? 0 : 10,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: isActive ? 0.2 : 0,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-3 max-w-md text-sm text-neutral-50/90 md:text-base"
                  style={{ pointerEvents: isActive ? 'auto' : 'none' }}
                >
                  {panel.descripcion}
                </motion.p>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
