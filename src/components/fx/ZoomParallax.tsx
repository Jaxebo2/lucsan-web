import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface Props {
  image: { src: string; alt?: string };
  title: string;
  /** Subtítulo arriba del título (cliente, año, sector, etc.) */
  eyebrow?: string;
  /** Pie de imagen opcional (badges). */
  tags?: string[];
  /** Altura del scroll trigger en vh (default 220). */
  scrollHeight?: number;
}

/**
 * ZoomParallax — hero inmersivo de proyecto.
 * Una imagen central + título overlay. Scroll → la imagen escala hasta llenar
 * el viewport (efecto cinematográfico tipo "te metés dentro"). El título
 * se desvanece a la mitad del scroll. Al terminar, sigue la landing del caso.
 */
export default function ZoomParallax({
  image,
  title,
  eyebrow,
  tags = [],
  scrollHeight = 220,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Card empieza centrado y compacto (60vw × ~50vh). Scale 1 → 3 garantiza
  // que cubre el viewport completo aún en pantallas ultra-anchas o portrait.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 3]);
  const radius = useTransform(scrollYProgress, [0, 0.85], [24, 0]);
  // Texto: opacidad 1 → 0 antes de que la imagen ocupe todo (no queremos
  // verlo cuando la imagen ya esté full-bleed).
  const textOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  // Overlay dark: aumenta al inicio para legibilidad del texto, desaparece al final
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.5, 0]);

  return (
    <div
      ref={ref}
      className="zoom-parallax relative w-full"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-brand-black">
        <motion.div
          style={{ scale, borderRadius: radius }}
          className="relative aspect-[16/9] w-[68vw] overflow-hidden shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6)] will-change-transform"
        >
          <img
            src={image.src}
            alt={image.alt ?? ''}
            draggable={false}
            className="absolute inset-0 h-full w-full object-cover"
          />
          {/* Dark overlay para legibilidad de texto durante el zoom */}
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30"
          />

          {/* Title overlay */}
          <motion.div
            style={{ opacity: textOpacity, y: textY }}
            className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center"
          >
            {eyebrow && (
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/85 md:text-sm">
                {eyebrow}
              </p>
            )}
            <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
              {title}
            </h1>
            {tags.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-white backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
