import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  centerImage: ImageItem;
  /** 6 imágenes outer que rodean al centro. */
  outerImages: ImageItem[];
  title: string;
  eyebrow?: string;
  tags?: string[];
  /** Altura del scroll trigger en vh (default 250). */
  scrollHeight?: number;
}

interface PictureConfig {
  img: ImageItem;
  isCenter: boolean;
  cx: number;        // % horizontal del centro de la card
  cy: number;        // % vertical del centro de la card
  w: string;         // ancho (vw)
  h: string;         // alto (vh)
  ml: string;        // margin-left negativo = -w/2 (centering)
  mt: string;        // margin-top negativo = -h/2 (centering)
  scaleEnd: number;
  exitMult: number;
}

/**
 * ZoomParallax — hero inmersivo multi-imagen.
 *
 * GRID 2-3-2: 6 outers en filas top/middle/bottom + central. Todos del mismo tamaño.
 * SCROLL: outers se trasladan rápido hacia afuera + fade-out temprano (0.2→0.55).
 *         Distintos exitMult/scaleEnd por imagen → sensación de profundidad/parallax.
 *         Central queda en (50,50) y crece hasta llenar el viewport (scale 4.6).
 * FINAL: solo la central full-bleed + texto del proyecto overlay.
 *
 * Centering vía margin negativo (más predecible que translate + scale).
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

  // 6 outers únicos (repetir desde el array si hay menos)
  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // Grid 2-3-2: uniform 22vw × 22vh para todas las cards
  // Top row (cy=22%):    O1 (cx=25%), O2 (cx=75%)
  // Mid row (cy=50%):    O3 (cx=12%), CENTER (cx=50%), O4 (cx=88%)
  // Bottom row (cy=78%): O5 (cx=25%), O6 (cx=75%)
  const W = '22vw';
  const H = '22vh';
  const ML = '-11vw';
  const MT = '-11vh';

  const pictures: PictureConfig[] = [
    // CENTER (mid row)
    { img: centerImage, isCenter: true,  cx: 50, cy: 50, w: W, h: H, ml: ML, mt: MT, scaleEnd: 4.6, exitMult: 1 },
    // Top row
    { img: safeOuters[0]!, isCenter: false, cx: 25, cy: 22, w: W, h: H, ml: ML, mt: MT, scaleEnd: 3,   exitMult: 6 },
    { img: safeOuters[1]!, isCenter: false, cx: 75, cy: 22, w: W, h: H, ml: ML, mt: MT, scaleEnd: 2.8, exitMult: 6.5 },
    // Mid row sides
    { img: safeOuters[2]!, isCenter: false, cx: 12, cy: 50, w: W, h: H, ml: ML, mt: MT, scaleEnd: 2.5, exitMult: 7 },
    { img: safeOuters[3]!, isCenter: false, cx: 88, cy: 50, w: W, h: H, ml: ML, mt: MT, scaleEnd: 2.5, exitMult: 7 },
    // Bottom row
    { img: safeOuters[4]!, isCenter: false, cx: 25, cy: 78, w: W, h: H, ml: ML, mt: MT, scaleEnd: 3.2, exitMult: 5.5 },
    { img: safeOuters[5]!, isCenter: false, cx: 75, cy: 78, w: W, h: H, ml: ML, mt: MT, scaleEnd: 3,   exitMult: 6 },
  ];

  // Texto del overlay aparece después de que los outers se fueron
  const textOpacity = useTransform(scrollYProgress, [0.6, 0.92], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.6, 1], [40, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.55, 0.95], [0, 0.55]);

  return (
    <div
      ref={ref}
      className="zoom-parallax relative w-full"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden bg-brand-black">
        {pictures.map((p, i) => (
          <ZoomImage
            key={i}
            picture={p}
            progress={scrollYProgress}
            overlayOpacity={p.isCenter ? overlayOpacity : undefined}
          />
        ))}

        {/* Text overlay — capa separada (z-10) sobre la central full-bleed */}
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

/* ============================ Sub-componente: imagen individual ============================ */

interface ZoomImageProps {
  picture: PictureConfig;
  progress: MotionValue<number>;
  overlayOpacity?: MotionValue<number>;
}

function ZoomImage({ picture, progress, overlayOpacity }: ZoomImageProps) {
  // Posición animada: la central queda en su lugar; los outers se van hacia afuera
  // (vector desde el centro del viewport extendido por exitMult)
  const cxEnd = picture.isCenter ? picture.cx : 50 + (picture.cx - 50) * picture.exitMult;
  const cyEnd = picture.isCenter ? picture.cy : 50 + (picture.cy - 50) * picture.exitMult;

  const cxNum = useTransform(progress, [0, 1], [picture.cx, cxEnd]);
  const cyNum = useTransform(progress, [0, 1], [picture.cy, cyEnd]);
  const top = useTransform(cyNum, (v) => `${v}%`);
  const left = useTransform(cxNum, (v) => `${v}%`);

  const scale = useTransform(progress, [0, 1], [1, picture.scaleEnd]);

  // Outer fade-out temprano (entre 0.2 y 0.55) → ya no son visibles cuando la central domina
  const outerOpacity = useTransform(progress, [0.2, 0.55], [1, 0]);
  const opacity = picture.isCenter ? 1 : outerOpacity;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        width: picture.w,
        height: picture.h,
        marginLeft: picture.ml,
        marginTop: picture.mt,
        scale,
        opacity,
        zIndex: picture.isCenter ? 5 : 1,
        willChange: 'transform, opacity',
      }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-lg">
        <img
          src={picture.img.src}
          alt={picture.img.alt ?? ''}
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {overlayOpacity && (
          <motion.div
            style={{ opacity: overlayOpacity }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20"
          />
        )}
      </div>
    </motion.div>
  );
}
