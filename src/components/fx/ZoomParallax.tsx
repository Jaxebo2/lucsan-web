import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

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
  /** Ancho de la card en vw. El alto sale del aspect ratio del layout. */
  w: number;
  scaleEnd: number;
  exitMult: number;
}

interface Layout {
  /** [ancho, alto] del aspect ratio de las cards. */
  aspect: [number, number];
  /** Posiciones: [cx, cy, wVw, scaleEnd, exitMult] — índice 0 = centro. */
  slots: Array<[number, number, number, number, number]>;
}

// DESKTOP: 2-3-2, cards 16:9
const DESKTOP: Layout = {
  aspect: [16, 9],
  slots: [
    [50, 50, 26, 0, 1], // centro (scale se calcula para cubrir viewport)
    [33, 12, 26, 2.8, 6],
    [67, 12, 26, 2.8, 6],
    [18, 50, 22, 2.5, 7],
    [82, 50, 22, 2.5, 7],
    [33, 88, 26, 3.2, 5.5],
    [67, 88, 26, 3, 6],
  ],
};

// MÓVIL: viewport vertical → cards verticales 3:4, más grandes y agrupadas.
// Fila superior (2), fila media (2 laterales asomando + centro), fila inferior (2).
const MOBILE: Layout = {
  aspect: [3, 4],
  slots: [
    [50, 50, 40, 0, 1],
    [28, 22, 40, 2.8, 6],
    [72, 22, 40, 2.8, 6],
    [14, 50, 26, 2.5, 7],
    [86, 50, 26, 2.5, 7],
    [28, 78, 40, 3.2, 5.5],
    [72, 78, 40, 3, 6],
  ],
};

/**
 * ZoomParallax — hero inmersivo multi-imagen.
 *
 * Desktop: grid 2-3-2 de cards 16:9. Móvil: grid de cards verticales 3:4.
 * Scroll: los outers viajan hacia afuera a distintas velocidades (parallax) y
 * se desvanecen; la central crece hasta cubrir TODO el viewport (escala calculada
 * con el tamaño real de la pantalla) y aparece el título encima.
 *
 * Animación en el primer 70% del scroll; el resto es salida rápida.
 */
export default function ZoomParallax({
  centerImage,
  outerImages,
  title,
  eyebrow,
  tags = [],
  scrollHeight = 200,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Tamaño real del viewport (para layout móvil y escala de cobertura).
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const layout = vp.w < 768 ? MOBILE : DESKTOP;

  const animProgress = useTransform(scrollYProgress, (v) => Math.min(v / 0.7, 1));

  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // Escala de la central para CUBRIR el viewport completo (+5% de margen).
  const [aw, ah] = layout.aspect;
  const centerWpx = (layout.slots[0]![2] / 100) * vp.w;
  const centerHpx = (centerWpx * ah) / aw;
  const coverScale = Math.max(vp.w / centerWpx, vp.h / centerHpx) * 1.05;

  const pictures: PictureConfig[] = layout.slots.map(([cx, cy, w, scaleEnd, exitMult], i) => ({
    img: i === 0 ? centerImage : safeOuters[i - 1]!,
    isCenter: i === 0,
    cx,
    cy,
    w,
    scaleEnd: i === 0 ? coverScale : scaleEnd,
    exitMult,
  }));

  const textOpacity = useTransform(animProgress, [0.6, 0.92], [0, 1]);
  const textY = useTransform(animProgress, [0.6, 1], [40, 0]);
  const overlayOpacity = useTransform(animProgress, [0.55, 0.95], [0, 0.55]);

  return (
    <div
      ref={ref}
      className="zoom-parallax relative w-full"
      style={{ height: `${scrollHeight}vh` }}
    >
      <div
        className="sticky top-0 flex w-full items-center justify-center overflow-hidden bg-brand-black"
        style={{ height: '100svh' }}
      >
        {pictures.map((p, i) => (
          <ZoomImage
            key={`${layout === MOBILE ? 'm' : 'd'}-${i}`}
            picture={p}
            aspect={layout.aspect}
            progress={animProgress}
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
  aspect: [number, number];
  progress: MotionValue<number>;
  overlayOpacity?: MotionValue<number>;
}

function ZoomImage({ picture, aspect, progress, overlayOpacity }: ZoomImageProps) {
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
        width: `${picture.w}vw`,
        aspectRatio: `${aspect[0]} / ${aspect[1]}`,
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
