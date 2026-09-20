import { useLayoutEffect, useRef } from 'react';

interface HeroDesignProps {
  /** Raw HTML of the exported design (imported with `?raw`). */
  html: string;
  /** Canvas size the design was exported at. */
  width: number;
  height: number;
  /** 'cover' fills the hero and crops the overflow, 'contain' shows the whole canvas. */
  fit?: 'cover' | 'contain';
  /**
   * Wrap the name layers in `.title-group` and the testimonial layers in
   * `.testimonial-group` so they can be animated as two blocks.
   * Only the desktop export uses these ids — leave it off for mobile.
   */
  group?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The exported designs are fixed-size canvases (e.g. 4591x2350) made of absolutely
 * positioned text/image layers. This wrapper centres that canvas and scales it with a
 * CSS transform so it lines up with the hero photo behind it, at any viewport size.
 *
 * It also exposes the live scale factor as `--hero-scale`, which lets CSS move layers
 * *inside* the canvas by screen pixels: `translate(calc(var(--x) / var(--hero-scale)))`.
 */
export function HeroDesign({ html, width, height, fit = 'cover', group = false, className = '', style }: HeroDesignProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    const canvas = canvasRef.current;
    if (!box || !canvas) return;

    const page = canvas.querySelector<HTMLElement>('.page');

    // The export hard-codes `overflow: hidden` on .page, which clips at canvas
    // coords 0..2350. The morph moves layers well outside that box (the title
    // ends up around y = -1300 at tablet width), so the clip has to go.
    // Nothing is lost: .hero-design still clips everything to the viewport.
    if (group && page) page.style.overflow = 'visible';

    if (group && page && !page.querySelector('.title-group')) {
      const titleIds = new Set(['text_2', 'text_3']);
      const testimonialIds = new Set([
        'text_4', 'text_5', 'text_6', 'text_7', 'text_8', 'text_9', 'text_10',
        'text_11', 'text_12', 'text_13', 'text_14', 'text_15', 'text_16', 'text_17',
        'text_18', 'text_19', 'text_20', 'text_21', 'text_22', 'text_23', 'text_24',
        'image_25', 'image_26', 'image_27', 'image_28', 'image_29', 'image_30', 'image_31',
      ]);
      const pageChildren = Array.from(page.children) as HTMLElement[];
      const moveIntoGroup = (ids: Set<string>, className: string) => {
        const members = pageChildren.filter((child) => ids.has(child.id));
        if (members.length === 0) return;
        const group = document.createElement('div');
        group.className = className;
        group.style.position = 'absolute';
        group.style.inset = '0';
        group.style.pointerEvents = 'none';
        members[0].before(group);
        members.forEach((member) => group.appendChild(member));
      };

      moveIntoGroup(titleIds, 'title-group');
      moveIntoGroup(testimonialIds, 'testimonial-group');
    }

    const resize = () => {
      const w = box.clientWidth || window.innerWidth;
      const h = box.clientHeight || window.innerHeight;
      const scale = fit === 'cover'
        ? Math.max(w / width, h / height)
        : Math.min(w / width, h / height);
      canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
      // let the grouped layers convert screen px -> canvas px
      canvas.style.setProperty('--hero-scale', String(scale));
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(box);
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [width, height, fit, group]);

  return (
    <div
      ref={boxRef}
      className={`hero-design ${className}`}
      style={{ overflow: 'hidden', pointerEvents: 'none', ...style }}
    >
      <div
        ref={canvasRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width,
          height,
          transformOrigin: 'center center',
          transform: `translate(-50%, -50%) scale(${typeof window !== 'undefined' ? Math.max(window.innerWidth / width, window.innerHeight / height) : 1})`,
          willChange: 'transform',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
