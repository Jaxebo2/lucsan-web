import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ImageItem {
  src: string;
  alt?: string;
}

interface Props {
  centerImage: ImageItem;
  /** Outers (10 idealmente para layout 3-4-3). Si hay menos se repiten. */
  outerImages: ImageItem[];
  title: string;
  eyebrow?: string;
  tags?: string[];
  /** Altura del scroll trigger en vh (default 140 → ~6-7 ticks). */
  scrollHeight?: number;
}

interface PictureConfig {
  img: ImageItem;
  isCenter: boolean;
  cx: number;
  cy: number;
  w: string;
  h: string;
  ml: string;
  mt: string;
  scaleEnd: number;
  exitMult: number;
}

/**
 * ZoomParallax — hero inmersivo multi-imagen.
 *
 * GRID 3-4-3: top row 3 outers · middle row 4 outers + central · bottom row 3 outers.
 * Total 10 outers + 1 central = 11 imágenes (grid denso, sin huecos grandes).
 * Cada outer escapa hacia afuera a distinta velocidad (parallax depth).
 * scrollHeight bajo (140vh) → recorrido corto, smooth scroll via Lenis global.
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

  // 10 outers únicos (repetir si hay menos)
  const safeOuters: ImageItem[] = Array.from({ length: 10 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // Sizes: outers 14vw×16vh (top/bottom) o 12vw×18vh (middle sides). Center 18vw×18vh.
  const O_TB = { w: '14vw', h: '16vh', ml: '-7vw',  mt: '-8vh'  };
  const O_MD = { w: '12vw', h: '18vh', ml: '-6vw',  mt: '-9vh'  };
  const CTR  = { w: '18vw', h: '18vh', ml: '-9vw',  mt: '-9vh'  };

  // 3-4-3 layout
  const pictures: PictureConfig[] = [
    // CENTER (mid row, cx=50%)
    { img: centerImage,    isCenter: true,  cx: 50, cy: 50, ...CTR,  scaleEnd: 5.7, exitMult: 1 },
    // TOP ROW (cy=18%): 3 outers
    { img: safeOuters[0]!, isCenter: false, cx: 25, cy: 18, ...O_TB, scaleEnd: 3.0, exitMult: 5 },
    { img: safeOuters[1]!, isCenter: false, cx: 50, cy: 18, ...O_TB, scaleEnd: 2.8, exitMult: 6 },
    { img: safeOuters[2]!, isCenter: false, cx: 75, cy: 18, ...O_TB, scaleEnd: 3.0, exitMult: 5 },
    // MIDDLE ROW (cy=50%): 4 outers around the center
    { img: safeOuters[3]!, isCenter: false, cx: 12, cy: 50, ...O_MD, scaleEnd: 2.8, exitMult: 6 },
    { img: safeOuters[4]!, isCenter: false, cx: 32, cy: 50, ...O_MD, scaleEnd: 2.5, exitMult: 7 },
    { img: safeOuters[5]!, isCenter: false, cx: 68, cy: 50, ...O_MD, scaleEnd: 2.5, exitMult: 7 },
    { img: safeOuters[6]!, isCenter: false, cx: 88, cy: 50, ...O_MD, scaleEnd: 2.8, exitMult: 6 },
    // BOTTOM ROW (cy=82%): 3 outers
    { img: safeOuters[7]!, isCenter: false, cx: 25, cy: 82, ...O_TB, scaleEnd: 3.2, exitMult: 5 },
    { img: safeOuters[8]!, isCenter: false, cx: 50, cy: 82, ...O_TB, scaleEnd: 2.8, exitMult: 6 },
    { img: safeOuters[9]!, isCenter: false, cx: 75, cy: 82, ...O_TB, scaleEnd: 3.2, exitMult: 5 },
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

  // Fade-out temprano para que los outers ya no estén visibles cuando la central domina
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
