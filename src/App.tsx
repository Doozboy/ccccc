import { useEffect, useRef, useState } from 'react';
import VideoThumbnail from "./components/VideoThumbnail";
import { ClickWrapper } from "./components/ClickWrapper";
import { Mail, Instagram } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroDesign } from './components/HeroDesign';
import heroDesktopHtml from './hero/hero-desktop.html?raw';
import heroMobileHtml from './hero/hero-mobile.html?raw';
import { useHeroMorph } from './hooks/useHeroMorph';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const isMobile = () => window.innerWidth < 768;

interface HeroImage {
  src: string;
  delay?: number;
  isStatic?: boolean;
  zIndex?: number;
  scrollTo?: string;
  href?: string;
  isSmall?: boolean;
  noHover?: boolean;
  /** which part of the desktop -> tablet morph this layer belongs to */
  morph?: 'figure' | 'me2';
}

const mobileImages: HeroImage[] = [
  { src: '/mobile/mbme.webp',      isStatic: true, zIndex: 11, },
  { src: '/mobile/mbme.webp',      isStatic: true,              zIndex: 10, scrollTo: '#portfolio' },
];

const desktopImages: HeroImage[] = [
  { src: '/pc/me.webp',    delay: 2.2, isStatic: true,  noHover: false, morph: 'figure', zIndex: 2 },
  { src: '/pc/me 2.webp',  delay: 2.4, isStatic: true,  noHover: false, morph: 'me2', zIndex: 3 },
];

// Fixed canvas sizes of the exported hero designs
const HERO_DESKTOP = { width: 4591, height: 2350 };
const HERO_MOBILE  = { width: 1080, height: 1920 };

const socialVideos = Array.from({ length: 12 }, (_, i) =>
  `https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/reels/${i + 1}.webm`
);

const featuredVideos = [
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/1.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2%2C5%2C6%2C8%2C9/2.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/3.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/4.mp4",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2%2C5%2C6%2C8%2C9/5.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2%2C5%2C6%2C8%2C9/6.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/7.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2%2C5%2C6%2C8%2C9/8.webm",
  "https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2%2C5%2C6%2C8%2C9/9.webm",
];

const stats = [
  { value: '3+', label: 'Years Experience'},
  { value: '99+', label: 'Projects Delivered' },
  { value: '12', label: 'Social Formats' },
  { value: '20+', label: 'Happy Clients' },
];

const skills = [
  { name: 'Motion Design'},
  { name: 'Brand Films'},
  { name: 'Social Content'},
  { name: 'Visual Identity'},
  { name: 'Art Direction'},
  { name: 'Storytelling'},
];

function App() {
  const [showContact, setShowContact] = useState(false);
  const [ready, setReady] = useState(false);
  const [heroHidden, setHeroHidden] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const portfolioSectionRef = useRef<HTMLDivElement>(null);

  // Detect mobile once at mount; update only on orientation change, not scroll.
  // This avoids the constant re-render / layout thrash that a scroll listener causes.
  const [mobile, setMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);

  // drives the desktop -> tablet hero morph (see src/hooks/useHeroMorph.ts)
  // Skip on mobile — it's a desktop-only effect and its resize listener
  // adds unnecessary work on phones.
  useHeroMorph(mobile);

  useEffect(() => {
    const heroImages = isMobile()
      ? ['/mobile/mbbg.webp', '/mobile/mbme.webp']
      : ['/pc/bg.webp', '/pc/me.webp', '/pc/me 2.webp'];

    const loaded = new Set<string>();
    const hideLoader = () => {
      setReady(true);
      const loader = document.getElementById('initial-loader');
      if (loader) {
        loader.classList.add('is-done');
        setTimeout(() => loader.remove(), 700);
      }
    };
    const checkDone = () => {
      if (loaded.size === heroImages.length) {
        requestAnimationFrame(() => setTimeout(hideLoader, 100));
      }
    };

    heroImages.forEach((src) => {
      const img = new Image();
      img.onload = () => { loaded.add(src); checkDone(); };
      img.onerror = () => { loaded.add(src); checkDone(); };
      img.src = src;
    });

    const timeout = setTimeout(() => {
      hideLoader();
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    ScrollTrigger.getAll().forEach(t => t.kill());
    if (!portfolioSectionRef.current) return;

    const isMobileView = isMobile();

    // Desktop-only: parallax on hero image layers. Skipping this on mobile
    // avoids ScrollTrigger creating a scrubbed timeline that fights the
    // mobile browser's scroll handling (a major source of freezing).
    if (!isMobileView) {
      const desktopEls = gsap.utils.toArray(".desktop-image");
      const desktopParallaxEls = desktopEls.filter((el: Element) => !el.classList.contains('no-parallax-y'));
      gsap.timeline({
        scrollTrigger: { trigger: portfolioSectionRef.current, start: "top bottom", end: "center top", scrub: 2 }
      }).to(desktopParallaxEls, { y: 200, ease: "power1.out" });
    }

    gsap.to(portfolioSectionRef.current, {
      y: -900,
      scrollTrigger: { trigger: portfolioSectionRef.current, start: "top bottom", end: "bottom top", scrub: 2 }
    });

    ScrollTrigger.create({
      trigger: portfolioSectionRef.current, start: "center bottom", fastScrollEnd: true,
      onEnter: () => setShowContact(true), onLeaveBack: () => setShowContact(false),
    });

    ScrollTrigger.create({
      trigger: portfolioSectionRef.current, start: 'top top', end: 'top top',
      onEnter: () => setHeroHidden(true), onLeaveBack: () => setHeroHidden(false),
    });

    return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
  }, []);

  const vh = (n: number) => mobile ? `${n}svh` : `${n}vh`;

  return (
    <div className={`relative ${ready ? 'hero-ready' : ''}`} style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1)' }}>
{/* Fixed background — desktop */}
      <ClickWrapper
        className="fixed inset-0 z-0 bg-interactive hidden md:block"
        scrollTo="#portfolio"
        glowColor="rgba(255,255,255,0.15)"
        noHover
        style={{
          backgroundImage: `url('/pc/bg.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'left center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.08)' }} />
      </ClickWrapper>

      {/* Fixed background — mobile */}
      <ClickWrapper
        className="fixed inset-0 z-0 bg-interactive md:hidden"
        scrollTo="#portfolio"
        glowColor="rgba(255,255,255,0.15)"
        noHover
        style={{
          backgroundImage: `url('/mobile/mbbg.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.08)' }} />
      </ClickWrapper>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className={`relative w-full overflow-hidden bg-transparent transition-opacity duration-500 ${heroHidden ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        style={{ minHeight: vh(100), height: vh(100) }}
      >
        {/* Mobile layers — only rendered on mobile to keep the 57KB desktop
            hero HTML out of the mobile DOM (huge perf win on phones) */}
        {mobile && (
          <div className="md:hidden">
            {mobileImages.map((img, index) => (
              <ClickWrapper
                key={index}
                href={img.href}
                scrollTo={img.scrollTo}
                glowColor="rgba(201,168,76,0.3)"
                noHover
                className="mobile-image hero-image-layer fixed overflow-hidden"
                style={{
                  ...(img.isStatic
                    ? { inset: 0, width: '100%', height: '100%', zIndex: img.zIndex }
                    : {
                        inset: 0, width: '100%', height: '100%',
                        zIndex: img.zIndex,
                        animation: `slideUp 1s ease-out ${img.delay}s forwards`,
                        transform: 'translateY(100vh)',
                      })
                }}
              >
                <img src={img.src} alt="" decoding="async" className="w-full h-full object-contain" />
              </ClickWrapper>
            ))}

            {/* Mobile-only hero design (mobile.html) */}
            <HeroDesign
              html={heroMobileHtml}
              width={HERO_MOBILE.width}
              height={HERO_MOBILE.height}
              fit="contain"
              className="mobile-image hero-image-layer fixed no-parallax-y hero-enter"
              style={{ inset: 0, width: '100%', height: '100%', zIndex: 20 }}
            />
          </div>
        )}

        {/* Desktop layers — only rendered on desktop */}
        {!mobile && (
          <div className="hidden md:block">
            {desktopImages.map((img, index) => (
              <ClickWrapper
                key={index}
                href={img.href}
                scrollTo={img.scrollTo}
                glowColor="rgba(201,168,76,0.3)"
                noHover
                className={`desktop-image hero-image-layer fixed overflow-hidden ${img.isSmall ? 'name-hover' : ''}`}
                style={{
                  ...(img.isSmall
                    ? {
                        top: -10, left: -30, width: '38%', maxWidth: 520, height: 'auto', zIndex: 50,
                        animation: `slideUp 1s ease-out ${img.delay}s forwards`,
                        transform: 'translateY(100vh)',
                      }
                    : {
                        inset: 0, width: '100%', height: '100%',
                        zIndex: img.zIndex ?? (img.isStatic ? 0 : index + 10),
                        animation: img.isStatic ? 'none' : `slideUp 1s ease-out ${img.delay}s forwards`,
                        transform: img.isStatic ? 'translateY(0)' : 'translateY(100vh)',
                        pointerEvents: 'none',
                      })
                }}
              >
                <div className={`w-full h-full ${img.morph === 'figure' ? 'hero-rig-figure' : img.morph === 'me2' ? 'hero-me2' : ''}`}>
                  <img src={img.src} alt="" decoding="async" className={`${img.isSmall ? 'w-full h-auto' : 'w-full h-full object-contain'} ${img.src.includes('me 2') ? 'hero-img-me2' : 'hero-img-me'}`} />
                </div>
              </ClickWrapper>
            ))}

            {/* Title — rendered behind me.webp */}
            <HeroDesign
              html={heroDesktopHtml}
              width={HERO_DESKTOP.width}
              height={HERO_DESKTOP.height}
              fit="contain"
              group
              className="desktop-image hero-image-layer fixed no-parallax-y hero-design-text hide-testimonials hero-enter"
              style={{ inset: 0, width: '100%', height: '100%', zIndex: 1 }}
            />

            {/* Testimonials — rendered on top */}
            <HeroDesign
              html={heroDesktopHtml}
              width={HERO_DESKTOP.width}
              height={HERO_DESKTOP.height}
              fit="contain"
              group
              className="desktop-image hero-image-layer fixed no-parallax-y hero-design-text hide-title hero-enter"
              style={{ inset: 0, width: '100%', height: '100%', zIndex: 20 }}
            />
          </div>
        )}

        {/* Scroll indicator */}
        <div className="hero-enter absolute bottom-4 sm:bottom-6 md:bottom-8 left-0 right-0 z-[60] flex justify-center pointer-events-none">
          <button
            className="scroll-indicator group flex flex-col items-center gap-4 pointer-events-auto"
            onClick={() => {
              const el = document.querySelector('#portfolio');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            aria-label="Scroll to portfolio"
          >
            <span className="scroll-indicator-label ibm-font">SCROLL</span>
            <span className="scroll-indicator-track">
              <span className="scroll-indicator-dot" />
            </span>
          </button>
        </div>
      </div>


      {/* Portfolio Panel */}
      <div
        ref={portfolioSectionRef}
        id="portfolio"
        className="relative w-full portfolio-panel z-[9999]"
        style={{
          minHeight: vh(100),
          boxShadow: `0 -30px 80px -10px rgba(255,255,255,0.12), 0 -60px 120px -20px rgba(201,168,76,0.06), inset 0 1px 0 rgba(255,255,255,0.6), 0 30px 80px -10px rgba(0,0,0,0.35)`,
        }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-20">

          {/* Header */}
          <div className="text-center mb-20">
        
              <h2 className="syne text-black/90 mb-5 leading-none interactive-heading"
                  style={{ fontSize: 'clamp(3rem, 8vw, 7rem)', letterSpacing: '0.04em' }}>
                PORTFOLIO
              </h2>
          
          
         
              <p className="ibm-font text-black/55 max-w-2xl mx-auto text-base md:text-lg leading-relaxed interactive-text">
                Visual stories crafted to move people — from scroll-stopping reels to brand-defining films.
              </p>
         

            {/* Skill tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {skills.map((s) => (
                <ClickWrapper
                  key={s.name}
                
                  glowColor="rgba(201,168,76,0.3)"
                  className="tag-pill"
                >
                  {s.name}
                </ClickWrapper>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
            {stats.map((s, i) => (
              <ClickWrapper
                key={i}
               
                glowColor="rgba(201,168,76,0.4)"
                className="stat-card glow-border"
                style={{
                  background: 'rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.07)',
                  animationDelay: `${i * 0.4}s`,
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  textAlign: 'center',
                }}
              >
                <div className="syne font-bold text-black/90 stat-number-pulse"
                     style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', animationDelay: `${i * 0.4}s` }}>
                  {s.value}
                </div>
                <div className="ibm-font text-xs uppercase tracking-widest mt-1" style={{ color: 'var(--warm-gray)' }}>
                  {s.label}
                </div>
              </ClickWrapper>
            ))}
          </div>

          {/* Showreel */}
          <div className="mb-20">
            <ClickWrapper
              scrollTo="#showreel"
              glowColor="rgba(201,168,76,0.3)"
              className="section-rule section-rule-interactive"
            >
              <span className="syne text-sm font-semibold tracking-[0.25em] uppercase text-black/40 flex items-center gap-2">
                <span className="gold-dot" />
                SHOW REEL
              </span>
            </ClickWrapper>
            <div id="showreel" className="max-w-5xl mx-auto rounded-2xl overflow-hidden"
                 style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
              <VideoThumbnail
                src="https://cdn.jsdelivr.net/gh/Aamirnaqvi-mal/Videos@main/Portfolio/long/2,5,6,8,9/1.mp4"
                title="SHOW REEL 2026"
                isShowreel={true}
                thumbnailIndex={1}
              />
            </div>
          </div>

          {/* Social Content */}
          <div className="mb-20">
            <ClickWrapper
              scrollTo="#social"
              glowColor="rgba(201,168,76,0.3)"
              className="section-rule section-rule-interactive"
            >
              <span className="syne text-sm font-semibold tracking-[0.25em] uppercase text-black/40 flex items-center gap-2">
                <span className="gold-dot" />
                SOCIAL CONTENT
              </span>
            </ClickWrapper>
            <div id="social" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
              {socialVideos.map((url, i) => (
                <VideoThumbnail
                  key={i}
                  src={url}
                  title={`REEL ${String(i + 1).padStart(2, '0')}`}
                  aspectRatio="vertical"
                  thumbnailIndex={i + 11}
                />
              ))}
            </div>
          </div>

          {/* Featured Work */}
          <div className="mb-20">
            <ClickWrapper
              scrollTo="#featured"
              glowColor="rgba(201,168,76,0.3)"
              className="section-rule section-rule-interactive"
            >
              <span className="syne text-sm font-semibold tracking-[0.25em] uppercase text-black/40 flex items-center gap-2">
                <span className="gold-dot" />
                FEATURED WORK
              </span>
            </ClickWrapper>
            <div id="featured" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredVideos.map((url, i) => (
                <VideoThumbnail
                  key={i}
                  src={url}
                  title={`PROJECT ${String(i + 1).padStart(2, '0')}`}
                  isShowreel={false}
                  thumbnailIndex={i + 2}
                />
              ))}
            </div>
          </div>

          {/* Bottom disclaimer */}
            <p className="text-center ibm-font text-xs mt-12 pb-4" >
              All content is original work. Brands and clients belong to their respective owners.
            </p>
        </div>
      </div>

       {/* Contact Section */}
      {showContact && (
        <div
          id="contact-section"
          className={`fixed bottom-0 left-0 right-0 w-full overflow-hidden flex flex-col items-center justify-center z-30 bg-transparent opacity-0 animate-fade-in-delayed px-6`}
          style={{
            height: window.innerWidth < 768 ? '100svh' : '100vh',
            animationDelay: '0.2s', 
            animationFillMode: 'forwards',
            pointerEvents: 'auto'
          }}
        > 
         {/* Main Heading */}
          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bosenAlt text-[#181f22] text-center mb-0 tracking-wide max-w-4xl">
            LET'S START A CONVERSATION
          </h2>

         {/* Subheading */}
<p className="text-[#181f22] text-xl md:text-4xl lg:text-4xl ibm-font mb-8 text-center max-w-3xl">
  Drop me a message, let's make something users will love.
</p>

<div className="space-y-10 text-center max-w-full">
            {/* Email */}
            <div className="flex flex-col items-center gap-2">
              <Mail className="text-[#181f22] w-8 h-8" />
              <a
                href="https://mail.google.com/mail/?view=cm&to=Aamirnaqvi03@gmail.com" target="_blank"
                className="text-[#181f22] font-bosenAlt text-xl md:text-xl lg:text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200 break-words px-4"
              >
                AAMIRNAQVI03@GMAIL.COM
              </a>
              <p className="text-[#181f22] text-xl md:text-xl lg:text-2xl ibm-font mb-0 text-center">
  Let's create something that actually works.
</p>
            </div>

            {/* Whatsapp */}
            <div className="flex flex-col items-center gap-0">
              <svg className="text-[#181f22] w-8 h-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <a
                href="https://wa.link/uhhv7i"
                target="_blank"
                rel="noopener noreferrer"
  className="text-[#181f22] font-bosenAlt text-xl md:text-xl lg:text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200"
              >
                WHATSAPP
              </a>
              <p className="text-[#181f22] text-xl md:text-xl lg:text-2xl ibm-font mb-0 text-center">
          Lets talk more further
              </p>
            </div>

            {/* Instagram */}
            <div className="flex flex-col items-center gap-2">
              <Instagram className="text-[#181f22] w-8 h-8" />
              <a
                href="https://www.instagram.com/aamir.naqvii/"
                target="_blank"
                rel="noopener noreferrer"
                  className="text-[#181f22] font-bosenAlt text-xl md:text-xl lg:text-2xl tracking-wide hover:text-blue-500 transition-colors duration-200"
              >
                INSTAGRAM
              </a>
           <p className="text-[#181f22] text-xl md:text-xl lg:text-2xl ibm-font mb-0 text-center">
                Tap in for visuals with purpose. - follow the flow.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
