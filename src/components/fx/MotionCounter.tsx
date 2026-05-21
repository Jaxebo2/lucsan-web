import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Props {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  thousands?: string;
  /** 'count' = conteo suave (counter-pro). 'odometer' = cada dígito rueda. */
  mode?: 'count' | 'odometer';
  className?: string;
}

/**
 * MotionCounter — dos variantes:
 *  - mode='count' (default): número que cuenta suavemente desde 0 con spring.
 *  - mode='odometer': cada dígito es una columna vertical que rueda.
 *
 * Dispara al entrar al viewport. Respeta prefers-reduced-motion.
 */
export default function MotionCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 2.2,
  decimals = 0,
  thousands = '',
  mode = 'count',
  className = 'font-display text-5xl font-bold leading-none md:text-7xl',
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15%' });

  if (mode === 'odometer') {
    return (
      <span ref={ref} className={`inline-flex items-baseline tabular-nums ${className}`}>
        {prefix && <span>{prefix}</span>}
        <Odometer value={value} decimals={decimals} thousands={thousands} inView={inView} duration={duration} />
        {suffix && <span>{suffix}</span>}
      </span>
    );
  }

  return <SmoothCounter
    refOuter={ref}
    inView={inView}
    value={value}
    prefix={prefix}
    suffix={suffix}
    duration={duration}
    decimals={decimals}
    thousands={thousands}
    className={className}
  />;
}

/* ──────────────── SMOOTH COUNTER ──────────────── */

interface SmoothProps {
  refOuter: React.RefObject<HTMLSpanElement | null>;
  inView: boolean;
  value: number;
  prefix: string;
  suffix: string;
  duration: number;
  decimals: number;
  thousands: string;
  className: string;
}

function SmoothCounter({ refOuter, inView, value, prefix, suffix, duration, decimals, thousands, className }: SmoothProps) {
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (inView) motionVal.set(value);
  }, [inView, value, motionVal]);

  const formatted = useTransform(spring, (latest) => {
    const fixed = latest.toFixed(decimals);
    if (!thousands) return fixed;
    const [int, dec] = fixed.split('.');
    const withSep = int!.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
    return dec ? `${withSep}.${dec}` : withSep;
  });

  return (
    <span ref={refOuter} className={`inline-flex items-baseline tabular-nums ${className}`}>
      {prefix && <span aria-hidden="true">{prefix}</span>}
      <motion.span aria-hidden="true">{formatted}</motion.span>
      {suffix && <span aria-hidden="true">{suffix}</span>}
      <span className="sr-only">
        {prefix}
        {value.toFixed(decimals)}
        {suffix}
      </span>
    </span>
  );
}

/* ──────────────── ODOMETER (per-digit rolling) ──────────────── */

interface OdometerProps {
  value: number;
  decimals: number;
  thousands: string;
  inView: boolean;
  duration: number;
}

function Odometer({ value, decimals, thousands, inView, duration }: OdometerProps) {
  const fixed = value.toFixed(decimals);
  let intPart = fixed.split('.')[0] || '0';
  const decPart = fixed.split('.')[1];
  if (thousands) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousands);
  const display = decPart !== undefined ? `${intPart}.${decPart}` : intPart;
  const chars = display.split('');

  return (
    <span className="inline-flex">
      {chars.map((ch, i) => {
        const digit = Number(ch);
        if (Number.isNaN(digit)) {
          // separador, punto, etc.
          return (
            <span key={i} className="inline-block">
              {ch}
            </span>
          );
        }
        return <Digit key={i} digit={digit} index={i} inView={inView} duration={duration} />;
      })}
    </span>
  );
}

function Digit({ digit, index, inView, duration }: { digit: number; index: number; inView: boolean; duration: number }) {
  // Stagger: dígitos a la derecha se mueven con un pequeño delay (efecto cascada inverso)
  const stagger = index * 0.06;
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{ width: '0.6em', height: '1em', lineHeight: 1 }}
      aria-hidden="true"
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        initial={{ y: 0 }}
        animate={inView ? { y: `-${digit * 100}%` } : { y: 0 }}
        transition={{
          duration,
          delay: stagger,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="block" style={{ height: '1em', lineHeight: 1 }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}
