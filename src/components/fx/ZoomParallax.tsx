import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  /** Imagen central que terminará llenando el viewport (la cover del proyecto). */
  centerImage: ImageItem;
  /** 6 imágenes outer que rodean al centro (gallery del proyecto). Si hay menos, se repiten. */
  outerImages: ImageItem[];
  /** Título del proyecto — aparece al final del zoom como hero overlay. */
  title: string;
  eyebrow?: string;
  tags?: string[];
  /** Altura del scroll trigger en vh (default 250). */
  scrollHeight?: number;
}

/**
 * ZoomParallax — hero inmersivo multi-imagen.
 *
 * INICIO: grid de 7 imágenes (1 central + 6 outer) rodeando el centro del viewport.
 * SCROLL: la central escala 1→4 (llena viewport), las outer escalan 5-9 (se van por los bordes).
 * FINAL: solo se ve la central full-bleed + texto del proyecto (título/eyebrow/tags) revelado encima.
 *
 * Patrón Olivier Larose adaptado: cover del proyecto es la central.
 */
export default function ZoomParallax({
  centerImage,
  outerImages,
  title,
  eyebrow,
  tags = [],
  scrollHeight = 250,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Central escala 1→4 (de 25vw×25vh a 100vw×100vh = full viewport)
  const scaleCenter = useTransform(scrollYProgress, [0, 1], [1, 4]);
  // Outer escalan más rápido → se van por los bordes antes
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  // Texto: aparece en el último tercio del scroll, cuando la central ya domina
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.95], [40, 0]);
  // Gradient overlay sobre la central — sube al final para legibilidad del texto
  const overlayOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 0.6]);

  // Asegurar 6 outers (repetir si hay menos)
  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // 7 fotos: [0]=central, [1..6]=outer positions
  const pictures = [
    {
      img: centerImage,
      scale: scaleCenter,
      style: { width: '25vw', height: '25vh' } as const,
    },
    {
      img: safeOuters[0]!,
      scale: scale5,
      style: { top: '-30vh', left: '5vw', width: '35vw', height: '30vh' } as const,
    },
    {
      img: safeOuters[1]!,
      scale: scale6,
      style: { top: '-10vh', left: '-25vw', width: '20vw', height: '45vh' } as const,
    },
    {
      img: safeOuters[2]!,
      scale: scale5,
      style: { left: '27.5vw', width: '25vw', height: '25vh' } as const,
    },
    {
      img: safeOuters[3]!,
      scale: scale6,
      style: { left: '-27.5vw', width: '20vw', height: '25vh' } as const,
    },
    {
      img: safeOuters[4]!,
      scale: scale8,
      style: { top: '27.5vh', left: '5vw', width: '20vw', height: '25vh' } as const,
    },
    {
      img: safeOuters[5]!,
      scale: scale9,
      style: { top: '27.5vh', left: '-22.5vw', width: '30vw', height: '25vh' } as const,
    },
  ];

  return (
    <div
      ref={ref}
      className="zoom-parallax relative w-full"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-brand-black">
        {pictures.map((p, i) => (
          <motion.div
            key={i}
            style={{ scale: p.scale, ...p.style }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <img
                src={p.img.src}
                alt={p.img.alt ?? ''}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient overlay solo en la central, para legibilidad del texto al final */}
              {i === 0 && (
                <motion.div
                  style={{ opacity: overlayOpacity }}
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"
                />
              )}
            </div>
          </motion.div>
        ))}

        {/* Text overlay — capa separada, no escala. Aparece cuando la central llena el viewport. */}
        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
        >
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-white/85 md:text-sm">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-5 max-w-5xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white md:text-6xl lg:text-7xl">
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
      </div>
    </div>
  );
}
