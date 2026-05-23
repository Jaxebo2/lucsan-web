import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
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

interface PictureConfig {
  img: ImageItem;
  isCenter: boolean;
  cx: number; // % horizontal del centro de la card
  cy: number; // % vertical del centro de la card
  w: string;  // ancho CSS (vw)
  h: string;  // alto CSS (vh)
  scaleEnd: number;  // scale objetivo
  exitMult: number;  // velocidad de "fuga" hacia el borde (parallax depth)
}

/**
 * ZoomParallax — hero inmersivo multi-imagen con parallax 3D.
 *
 * INICIO: grid orgánico de 7 imágenes alrededor del centro.
 * SCROLL: cada outer se mueve HACIA AFUERA (su vector desde el centro extendido por exitMult)
 *         y escala simultáneamente. La central se queda y crece hasta llenar el viewport.
 *         Diferentes exitMult/scaleEnd por imagen → efecto de profundidad/distancia (parallax).
 * FINAL: solo la central llena el viewport + texto del proyecto overlay.
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

  // Asegurar 6 outers
  const safeOuters: ImageItem[] = Array.from({ length: 6 }, (_, i) => {
    if (outerImages.length === 0) return centerImage;
    return outerImages[i % outerImages.length]!;
  });

  // Config del grid inicial (basado en el layout de referencia del usuario)
  const pictures: PictureConfig[] = [
    // Central — skyscrapers / cover del proyecto
    { img: centerImage, isCenter: true, cx: 50, cy: 50, w: '25vw', h: '25vh', scaleEnd: 4.2, exitMult: 1 },
    // Top-center-right: imagen ancha (cityscape)
    { img: safeOuters[0]!, isCenter: false, cx: 58, cy: 18, w: '32vw', h: '22vh', scaleEnd: 4,   exitMult: 4 },
    // Top-left: imagen alta (portrait tall)
    { img: safeOuters[1]!, isCenter: false, cx: 16, cy: 42, w: '14vw', h: '45vh', scaleEnd: 5,   exitMult: 3 },
    // Middle-right
    { img: safeOuters[2]!, isCenter: false, cx: 82, cy: 50, w: '20vw', h: '22vh', scaleEnd: 4.5, exitMult: 4 },
    // Bottom-left
    { img: safeOuters[3]!, isCenter: false, cx: 18, cy: 82, w: '22vw', h: '18vh', scaleEnd: 5,   exitMult: 3 },
    // Bottom-center
    { img: safeOuters[4]!, isCenter: false, cx: 48, cy: 82, w: '22vw', h: '22vh', scaleEnd: 4,   exitMult: 5 },
    // Bottom-right
    { img: safeOuters[5]!, isCenter: false, cx: 78, cy: 78, w: '14vw', h: '18vh', scaleEnd: 6,   exitMult: 3.5 },
  ];

  // Texto del overlay — aparece cuando la central llena el viewport
  const textOpacity = useTransform(scrollYProgress, [0.65, 0.95], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.65, 1], [40, 0]);
  const overlayOpacity = useTransform(scrollYProgress, [0.6, 1], [0, 0.55]);

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

        {/* Text overlay — capa separada (z-10), aparece sobre la central full-bleed */}
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

/* ============================ Sub-componente: una imagen del zoom ============================ */

interface ZoomImageProps {
  picture: PictureConfig;
  progress: MotionValue<number>;
  overlayOpacity?: MotionValue<number>;
}

function ZoomImage({ picture, progress, overlayOpacity }: ZoomImageProps) {
  // Posición animada: la central NO se mueve; las outers viajan hacia afuera
  // siguiendo su vector desde (50, 50) extendido por exitMult
  const cxEnd = picture.isCenter ? picture.cx : 50 + (picture.cx - 50) * picture.exitMult;
  const cyEnd = picture.isCenter ? picture.cy : 50 + (picture.cy - 50) * picture.exitMult;

  const cxNum = useTransform(progress, [0, 1], [picture.cx, cxEnd]);
  const cyNum = useTransform(progress, [0, 1], [picture.cy, cyEnd]);
  const top = useTransform(cyNum, (v) => `${v}%`);
  const left = useTransform(cxNum, (v) => `${v}%`);

  // Scale: la central a 4.2 (llena viewport con margen); outers escalan según su scaleEnd
  const scale = useTransform(progress, [0, 1], [1, picture.scaleEnd]);

  // Opacity: la central siempre 1; outers fade-out conforme escapan
  const outerOpacity = useTransform(progress, [0.35, 0.7], [1, 0]);
  const opacity = picture.isCenter ? 1 : outerOpacity;

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        width: picture.w,
        height: picture.h,
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
