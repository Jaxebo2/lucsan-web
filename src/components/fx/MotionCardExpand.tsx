import { motion, AnimatePresence, useReducedMotion, LayoutGroup } from 'framer-motion';
import { useState } from 'react';

interface Item {
  titulo: string;
  descripcion?: string;
  numero?: string;
}

interface Props {
  items: Item[];
  variant?: 'default' | 'filled' | 'elevated';
}

/**
 * MotionCardExpand — grid de cards con layout animation cuando se expande.
 * Click en una card → se expande (toma 2 cols en grid) con descripción.
 * Las otras cards se reordenan suavemente vía Framer layout.
 */
export default function MotionCardExpand({ items, variant = 'filled' }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  const variantClass = {
    default: 'bg-surface-page border border-border-subtle',
    filled: 'bg-surface-muted',
    elevated: 'bg-surface-elevated shadow-sm',
  }[variant];

  const transition = reduceMotion
    ? { duration: 0 }
    : { type: 'spring' as const, stiffness: 220, damping: 26, mass: 0.9 };

  return (
    <LayoutGroup>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => {
          const isExpanded = expanded === i;
          return (
            <motion.button
              key={i}
              layout
              type="button"
              onClick={() => setExpanded(isExpanded ? null : i)}
              transition={{ layout: transition }}
              className={`group relative flex cursor-pointer flex-col rounded-2xl p-7 text-left transition-colors md:p-8 ${variantClass} ${
                isExpanded
                  ? 'border border-brand-coral ring-1 ring-brand-coral/30 md:col-span-2 lg:col-span-2'
                  : 'border border-transparent hover:border-brand-coral/40'
              }`}
              style={{ minHeight: 200 }}
            >
              <motion.div layout="position" className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {item.numero && (
                    <span className="font-display text-3xl font-bold text-text-accent">
                      {item.numero}
                    </span>
                  )}
                  <h3
                    className={`mt-4 font-display text-xl font-bold tracking-tight transition-colors md:text-2xl ${
                      isExpanded ? 'text-text-accent' : 'text-text-primary group-hover:text-text-accent'
                    }`}
                  >
                    {item.titulo}
                  </h3>
                </div>
                <motion.span
                  animate={{ rotate: isExpanded ? 45 : 0 }}
                  transition={transition}
                  className={`mt-1 flex h-9 w-9 flex-none items-center justify-center rounded-full border transition-colors ${
                    isExpanded
                      ? 'border-brand-coral text-brand-coral'
                      : 'border-current text-text-primary'
                  }`}
                  aria-hidden="true"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </motion.div>

              <AnimatePresence initial={false}>
                {isExpanded && item.descripcion && (
                  <motion.div
                    key="body"
                    initial={reduceMotion ? false : { opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{
                      height: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                      opacity: { duration: 0.3, delay: isExpanded ? 0.15 : 0 },
                    }}
                    className="overflow-hidden border-t border-current/10 pt-6"
                  >
                    <p className="text-base leading-relaxed text-text-secondary md:text-lg">
                      {item.descripcion}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
