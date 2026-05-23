import { motion, useInView, type Variants } from 'framer-motion';
import { useRef } from 'react';

type Preset = 'fade' | 'fade-up' | 'blur' | 'fade-blur' | 'slide-up';
type Per = 'word' | 'char';

interface Props {
  children: string;
  /** Granularidad de la animación: por palabra o por carácter (default 'word'). */
  per?: Per;
  /** Preset de animación. */
  preset?: Preset;
  /** Trigger: 'inView' (default) o 'load' (inmediato). */
  trigger?: 'inView' | 'load';
  /** Delay inicial en segundos. */
  delay?: number;
  /** Stagger entre items en segundos (default 0.04 word / 0.02 char). */
  stagger?: number;
  /** Duración de cada item (default 0.6). */
  duration?: number;
  /** Etiqueta semántica (default span). */
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  className?: string;
}

/**
 * MotionTextEffect — reveal animado de texto por palabra o carácter.
 * Presets inspirados en motion-primitives. Respeta prefers-reduced-motion.
 */
export default function MotionTextEffect({
  children,
  per = 'word',
  preset = 'fade-blur',
  trigger = 'inView',
  delay = 0,
  stagger,
  duration = 0.6,
  as = 'span',
  className = '',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10%' });

  const shouldAnimate = trigger === 'load' || inView;
  const effectiveStagger = stagger ?? (per === 'char' ? 0.02 : 0.04);

  const items = per === 'word'
    ? children.split(/(\s+)/).filter(Boolean)
    : children.split('');

  const variantsByPreset: Record<Preset, Variants> = {
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    'fade-up': {
      hidden: { opacity: 0, y: 12 },
      visible: { opacity: 1, y: 0 },
    },
    blur: {
      hidden: { opacity: 0, filter: 'blur(12px)' },
      visible: { opacity: 1, filter: 'blur(0px)' },
    },
    'fade-blur': {
      hidden: { opacity: 0, filter: 'blur(10px)', y: 8 },
      visible: { opacity: 1, filter: 'blur(0px)', y: 0 },
    },
    'slide-up': {
      hidden: { opacity: 0, y: 24 },
      visible: { opacity: 1, y: 0 },
    },
  };

  const itemVariants = variantsByPreset[preset];

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: effectiveStagger,
        delayChildren: delay,
      },
    },
  };

  const Tag = motion[as] as typeof motion.span;

  return (
    <Tag
      ref={ref as never}
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
      aria-label={children}
    >
      {items.map((item, i) => {
        const isWhitespace = /^\s+$/.test(item);
        if (isWhitespace && per === 'word') {
          return <span key={i} aria-hidden="true">{item}</span>;
        }
        return (
          <motion.span
            key={i}
            variants={itemVariants}
            transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
            className="inline-block"
            style={{ willChange: 'transform, filter, opacity' }}
            aria-hidden="true"
          >
            {item}
          </motion.span>
        );
      })}
    </Tag>
  );
}
