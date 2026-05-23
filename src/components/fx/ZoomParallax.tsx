import { motion, useScroll, useTransform, type MotionStyle } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  /** Array de 7 imágenes (center + 6 around). */
  images: ImageItem[];
  /** Altura total del scroll trigger en vh (default 300). */
  scrollHeight?: number;
}

/**
 * ZoomParallax — hero inmersivo de scroll.
 * 7 imágenes posicionadas en grilla. Cada una escala a un ritmo distinto
 * conforme el scroll avanza → efecto cinematográfico de zoom-in.
 * Patrón Olivier Larose / Studio Freight.
 */
export default function ZoomParallax({ images, scrollHeight = 300 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Cada imagen escala a un ritmo distinto — la central escala más rápido (sale del frame antes)
  const scale4 = useTransform(scrollYProgress, [0, 1], [1, 4]);
  const scale5 = useTransform(scrollYProgress, [0, 1], [1, 5]);
  const scale6 = useTransform(scrollYProgress, [0, 1], [1, 6]);
  const scale8 = useTransform(scrollYProgress, [0, 1], [1, 8]);
  const scale9 = useTransform(scrollYProgress, [0, 1], [1, 9]);

  // Posiciones + escalas en grid 3x3 (centro + 6 alrededor)
  const pictures: Array<{ scale: typeof scale4; style: MotionStyle }> = [
    {
      scale: scale4,
      style: { width: '25vw', height: '25vh' },
    },
    {
      scale: scale5,
      style: { top: '-30vh', left: '5vw', width: '35vw', height: '30vh' },
    },
    {
      scale: scale6,
      style: { top: '-10vh', left: '-25vw', width: '20vw', height: '45vh' },
    },
    {
      scale: scale5,
      style: { left: '27.5vw', width: '25vw', height: '25vh' },
    },
    {
      scale: scale6,
      style: { left: '-27.5vw', width: '20vw', height: '25vh' },
    },
    {
      scale: scale8,
      style: { top: '27.5vh', left: '5vw', width: '20vw', height: '25vh' },
    },
    {
      scale: scale9,
      style: { top: '27.5vh', left: '-22.5vw', width: '30vw', height: '25vh' },
    },
  ];

  return (
    <div ref={ref} className="zoom-parallax" style={{ height: `${scrollHeight}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        {pictures.map((p, i) => {
          const img = images[i % images.length];
          if (!img) return null;
          return (
            <motion.div
              key={i}
              style={{ scale: p.scale, ...p.style }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 will-change-transform"
            >
              <div className="relative h-full w-full overflow-hidden rounded-lg">
                <img
                  src={img.src}
                  alt={img.alt || ''}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
