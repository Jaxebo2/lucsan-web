import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState } from 'react';

interface Item {
  pregunta: string;
  respuesta: string;
}

interface Props {
  items: Item[];
}

/**
 * MotionFAQ — accordion vertical de FAQ con apertura smooth (height auto
 * con AnimatePresence). Solo uno abierto a la vez.
 */
export default function MotionFAQ({ items }: Props) {
  const [open, setOpen] = useState<number | null>(0);
  const reduceMotion = useReducedMotion();

  return (
    <div className="flex flex-col divide-y divide-border-subtle">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="py-5">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex w-full items-start justify-between gap-6 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display text-lg font-medium leading-snug transition-colors group-hover:text-text-accent md:text-xl">
                {item.pregunta}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { type: 'spring', stiffness: 300, damping: 22 }
                }
                className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center text-text-muted"
                aria-hidden="true"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.25, delay: isOpen ? 0.1 : 0 },
                  }}
                  className="overflow-hidden"
                >
                  <p className="pt-4 text-text-secondary md:text-lg">{item.respuesta}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
