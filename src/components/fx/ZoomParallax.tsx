import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  /** Imagen central que terminará llenando el viewport (la cover del proyecto). */
  centerImage: ImageItem;
  /** 6 imágenes outer que rodean al centro. Si hay menos, se repiten. */
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

  // Texto del overlay: aparece al final del scroll
  const textOpacity = useTransform(scrollYProgress, [0.55, 0.85], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.55, 0.95], [40, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 0.6]);

  // Asegurar 6 outers únicos (repetir desde el array si hay menos)
  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // Cada imagen: posición CENTRO en viewport (cx, cy), tamaño (w, h), scale animada.
  // Usamos framer-motion x/y para que se componga correctamente con scale.
  const pictures = [
    // Central
    { img: centerImage, scale: scaleCenter, cx: '50%', cy: '50%', w: '25vw', h: '25vh' },
    // Top-center
    { img: safeOuters[0]!, scale: scale5, cx: '52%', cy: '20%', w: '35vw', h: '30vh' },
    // Far-left tall
    { img: safeOuters[1]!, scale: scale6, cx: '15%', cy: '40%', w: '20vw', h: '45vh' },
    // Right of center
    { img: safeOuters[2]!, scale: scale5, cx: '80%', cy: '50%', w: '25vw', h: '25vh' },
    // Left of center
    { img: safeOuters[3]!, scale: scale6, cx: '20%', cy: '50%', w: '20vw', h: '25vh' },
    // Bottom-right
    { img: safeOuters[4]!, scale: scale8, cx: '60%', cy: '85%', w: '20vw', h: '25vh' },
    // Bottom-left
    { img: safeOuters[5]!, scale: scale9, cx: '25%', cy: '85%', w: '30vw', h: '25vh' },
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
            style={{
              position: 'absolute',
              top: p.cy,
              left: p.cx,
              width: p.w,
              height: p.h,
              x: '-50%',
              y: '-50%',
              scale: p.scale,
              willChange: 'transform',
            }}
          >
            <div className="relative h-full w-full overflow-hidden rounded-lg">
              <img
                src={p.img.src}
                alt={p.img.alt ?? ''}
                draggable={false}
                className="absolute inset-0 h-full w-full object-cover"
              />
              {/* Gradient overlay solo en la central, aparece al final para legibilidad */}
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
