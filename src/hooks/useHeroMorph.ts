import { useLayoutEffect } from 'react';

/* ------------------------------------------------------------------ *
 *  HERO MORPH — desktop  ->  tablet
 *
 *  Everything below is driven by a single progress value `p`:
 *      p = 0  ->  the PC layout (starting.png)
 *      p = 1  ->  the tablet layout (ending.png)
 *
 *  `p` is derived from the viewport width, so the layout genuinely
 *  interpolates while the window is being dragged narrower.
 *
 *  These are the only numbers you should need to touch.
 * ------------------------------------------------------------------ */
export const HERO_MORPH = {
  wideAt: 1280,
  narrowAt: 860,

  title: {
    to: { x: 0.515, y: 0.255 },
    scale: 1.17,
  },

  rig: {
    shift: { x: -0.15, y: 0.17 },
    scale: 0.99,
  },

  me2: {
    shift: -0.12,
    fadeFrom: 0.65,
    fadeTo: 0.7,
  },

  canvas: { w: 4591, h: 2350 },
  titleAnchor: { x: 1000, y: 793 },
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
/** smoothstep — eases both ends so the motion never starts or stops abruptly */
const ease = (p: number) => p * p * (3 - 2 * p);
const range = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/**
 * Writes the morph as CSS custom properties on <html>.
 * index.css consumes them; nothing re-renders React, so dragging the
 * window stays at 60fps.
 */
export function useHeroMorph(disabled?: boolean) {
  useLayoutEffect(() => {
    if (disabled) return;
    const root = document.documentElement;
    let frame = 0;

    const apply = () => {
      frame = 0;

      const W = window.innerWidth;
      const H = window.innerHeight;
      const M = HERO_MORPH;

      // raw progress, then eased
      const p = clamp01((M.wideAt - W) / (M.wideAt - M.narrowAt));
      const e = ease(p);

      // the scale HeroDesign applies to the canvas (fit="contain")
      const S = Math.min(W / M.canvas.w, H / M.canvas.h);
      const cx = W / 2;
      const cy = H / 2;

      /* ---- title: scale up + travel to top centre ---- */
      // where the title sits today, in screen px
      const natX = cx + (M.titleAnchor.x - M.canvas.w / 2) * S;
      const natY = cy + (M.titleAnchor.y - M.canvas.h / 2) * S;

      const tk = 1 + (M.title.scale - 1) * e;
      const wantX = natX + (M.title.to.x * W - natX) * e;
      const wantY = natY + (M.title.to.y * H - natY) * e;

      // transform-origin is the viewport centre, so scale() moves the
      // block too — subtract that before working out the translate.
      const ttx = wantX - (cx + tk * (natX - cx));
      const tty = wantY - (cy + tk * (natY - cy));

      /* ---- rig: figure + testimonials, one transform for both ---- */
      const rk = 1 + (M.rig.scale - 1) * e;
      const rtx = M.rig.shift.x * W * e;
      const rty = M.rig.shift.y * H * e;

      /* ---- me 2: out to the left, then gone ---- */
      const m2x = M.me2.shift * W * e;
      const m2o = 1 - range(p, M.me2.fadeFrom, M.me2.fadeTo);

      root.style.setProperty('--hero-p', p.toFixed(4));
      root.style.setProperty('--title-tx', `${ttx.toFixed(2)}px`);
      root.style.setProperty('--title-ty', `${tty.toFixed(2)}px`);
      root.style.setProperty('--title-k', tk.toFixed(4));
      root.style.setProperty('--rig-tx', `${rtx.toFixed(2)}px`);
      root.style.setProperty('--rig-ty', `${rty.toFixed(2)}px`);
      root.style.setProperty('--rig-k', rk.toFixed(4));
      root.style.setProperty('--me2-tx', `${m2x.toFixed(2)}px`);
      root.style.setProperty('--me2-o', m2o.toFixed(4));
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
    };
  }, [disabled]);
}
