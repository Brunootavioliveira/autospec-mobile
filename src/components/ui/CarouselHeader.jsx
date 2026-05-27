import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 
import { useAuth } from '../../context/AuthContext';
import mustangBanner from '../assets/mustang.png';

const AUTO_INTERVAL = 6000;

export function CarouselHeader() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const userNameUpperCase = user?.name ? ` ${user.name.toUpperCase()}` : '';

  const SLIDES = [
    {
      id: 1,
      title: `WELCOME TO AUTOSPEC,\n${userNameUpperCase}`,
      sub: 'YOUR ESSENTIAL AUTOMOTIVE\nINTELLIGENCE PLATFORM',
      imgSrc: mustangBanner,
    },
    {
      id: 2,
      title: 'ADVANCED VEHICLE\n INTELLIGENCE',
      sub: 'COMPLETE TECHNICAL ANALYSIS\n POWERED BY AI.',
      imgSrc: mustangBanner,
    },
    {
      id: 3,
      title: 'COMPARE ANY\n VEHICLE',
      sub: 'SIDE-BY-SIDE WITH AI-GENERATED\nPERFORMANCE SCORES',
      imgSrc: mustangBanner,
    },
    {
      id: 4,
      title: 'POWER-TO-WEIGHT\n& TRACK SCORE',
      sub: 'POPULATION PERCENTILES\nAND PERFORMANCE RADAR',
      imgSrc: mustangBanner,
    },
  ];

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), [SLIDES.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), [SLIDES.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [paused, next]);

  const pause  = () => setPaused(true);
  const resume = () => setPaused(false);

  const touchStart = useRef(null);
  const handleTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStart.current = null;
  };

  return (
    <div
      className="carousel-header"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="carousel-track"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((s, i) => {
          return (
            <div key={s.id} className="carousel-slide" aria-hidden={i !== current}>
              <img src={s.imgSrc} alt="" className="carousel-slide-img" />

              <div className="carousel-slide-overlay" style={{ background: 'transparent' }} />

              <div
                className="carousel-slide-content"
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-70%)',
                  left: 'clamp(10px, 4vw, 48px)',
                  right: '45%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  padding: 0,
                }}
              >
                <div
                  className="carousel-slide-title"
                  style={{
                    whiteSpace: 'pre-line',
                    color: '#000000b7',
                    fontSize: 'clamp(18px, 3vw, 38px)',
                    lineHeight: 1.08,
                    textShadow: '0 1px 3px rgba(0,0,0,.4)',
                  }}
                >
                  {s.title}
                </div>
                {s.sub && (
                  <div
                    className="carousel-slide-sub"
                    style={{
                      whiteSpace: 'pre-line',
                      color: '#353535c5',
                      fontSize: 'clamp(10px, 1vw, 13px)',
                      lineHeight: 1.5,
                    }}
                  >
                    {s.sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="carousel-arrows">
        <button className="carousel-arrow" onClick={prev} aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className="carousel-arrow" onClick={next} aria-label="Next">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="carousel-controls">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`carousel-dot ${i === current ? 'active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}