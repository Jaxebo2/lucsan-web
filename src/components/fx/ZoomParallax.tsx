import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  centerImage: ImageItem;
  outerImages: ImageItem[];
  title: string;
  eyebrow?: string;
  tags?: string[];
  scrollHeight?: number;
}

interface PictureConfig {
  img: ImageItem;
  isCenter: boolean;
  cx: number;
  cy: number;
  /** Ancho CSS (vw). El alto se calcula automático via aspect-ratio 16/9. */
  w: string;
  scaleEnd: number;
  exitMult: number;
}

/**
 * ZoomParallax — hero inmersivo multi-imagen, layout 2-3-2.
 *
 * Cards en formato 16:9 (aspect-ratio CSS). Tamaños generosos:
 * - Top/bottom outers + center: 26vw (≈100vw a scale 4 → llena viewport)
 * - Middle outers laterales: 22vw (un poco menores para no chocar con el centro)
 *
 * scrollHeight 140vh → ~6-7 ticks de scroll.
 * Lenis (global) suaviza cada tick.
 */
export default function ZoomParallax({
  centerImage,
  outerImages,
  title,
  eyebrow,
  tags = [],
  scrollHeight = 140,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // 2-3-2 layout, todas las cards 16:9
  const pictures: PictureConfig[] = [
    // CENTER (mid row, cx=50%)
    { img: centerImage,    isCenter: true,  cx: 50, cy: 50, w: '26vw', scaleEnd: 5,   exitMult: 1 },
    // TOP ROW (cy=20%)
    { img: safeOuters[0]!, isCenter: false, cx: 25, cy: 20, w: '26vw', scaleEnd: 2.8, exitMult: 6 },
    { img: safeOuters[1]!, isCenter: false, cx: 75, cy: 20, w: '26vw', scaleEnd: 2.8, exitMult: 6 },
    // MIDDLE ROW sides (cy=50%)
    { img: safeOuters[2]!, isCenter: false, cx: 10, cy: 50, w: '22vw', scaleEnd: 2.5, exitMult: 7 },
    { img: safeOuters[3]!, isCenter: false, cx: 90, cy: 50, w: '22vw', scaleEnd: 2.5, exitMult: 7 },
    // BOTTOM ROW (cy=80%)
    { img: safeOuters[4]!, isCenter: false, cx: 25, cy: 80, w: '26vw', scaleEnd: 3.2, exitMult: 5.5 },
    { img: safeOuters[5]!, isCenter: false, cx: 75, cy: 80, w: '26vw', scaleEnd: 3,   exitMult: 6 },
  ];

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

/* ============================ Sub-componente ============================ */

interface ZoomImageProps {
  picture: PictureConfig;
  progress: MotionValue<number>;
  overlayOpacity?: MotionValue<number>;
}

function ZoomImage({ picture, progress, overlayOpacity }: ZoomImageProps) {
  const cxEnd = picture.isCenter ? picture.cx : 50 + (picture.cx - 50) * picture.exitMult;
  const cyEnd = picture.isCenter ? picture.cy : 50 + (picture.cy - 50) * picture.exitMult;

  const cxNum = useTransform(progress, [0, 1], [picture.cx, cxEnd]);
  const cyNum = useTransform(progress, [0, 1], [picture.cy, cyEnd]);
  const top = useTransform(cyNum, (v) => `${v}%`);
  const left = useTransform(cxNum, (v) => `${v}%`);

  const scale = useTransform(progress, [0, 1], [1, picture.scaleEnd]);

  const outerOpacity = useTransform(progress, [0.2, 0.55], [1, 0]);
  const opacity = picture.isCenter ? 1 : outerOpacity;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        width: picture.w,
        aspectRatio: '16 / 9',
        x: '-50%',
        y: '-50%',
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
