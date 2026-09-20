import { useRef, useCallback } from 'react';

interface ClickWrapperProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  href?: string;
  onClick?: () => void;
  scrollTo?: string;
  refresh?: boolean;
  ripple?: boolean;
  scale?: number;
  style?: React.CSSProperties;
  noHover?: boolean;
}

export function ClickWrapper({
  children,
  className = '',
  glowColor = 'rgba(201,168,76,0.6)',
  href,
  onClick,
  scrollTo,
  refresh,
  ripple = true,
  scale = 1.02,
  style = {},
  noHover = false,
}: ClickWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (ripple && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rippleEl = document.createElement('span');
        rippleEl.style.cssText = `
          position: absolute;
          border-radius: 50%;
          background: ${glowColor};
          transform: scale(0);
          animation: click-ripple 0.6s ease-out;
          pointer-events: none;
          width: 20px;
          height: 20px;
          left: ${x - 10}px;
          top: ${y - 10}px;
          z-index: 999;
        `;
        ref.current.appendChild(rippleEl);
        setTimeout(() => rippleEl.remove(), 600);
      }

      if (refresh) {
        window.location.reload();
      } else if (href) {
        window.open(href, '_blank');
      } else if (scrollTo) {
        const el = document.querySelector(scrollTo);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (onClick) {
        onClick();
      }
    },
    [glowColor, href, onClick, scrollTo, refresh, ripple]
  );

  return (
    <div
      ref={ref}
      className={noHover ? className : `click-wrapper ${className}`}
      onClick={handleClick}
      style={{ ...style, cursor: 'pointer', '--scale': scale } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
