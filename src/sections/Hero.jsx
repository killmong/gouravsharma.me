import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { profile } from "../content";

const Lanes = lazy(() => import("../scene/Lanes"));

function useMedia(query) {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

export default function Hero() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(true);
  const reducedMotion = useMedia("(prefers-reduced-motion: reduce)");
  const compact = useMedia("(max-width: 720px)");
  const touch = useMedia("(pointer: coarse)");

  // stop rendering the scene once the hero is scrolled out of view
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section id="top" className="hero" ref={ref}>
      <Suspense fallback={null}>
        <Lanes surfaceRef={ref} running={visible} reducedMotion={reducedMotion} compact={compact} />
      </Suspense>

      <div className="hero-copy wrap">
        <h1 className="hero-name">
          <span>Gourav</span>
          <span>Sharma</span>
        </h1>
        <p className="hero-intro">{profile.intro}</p>
        <div className="hero-actions">
          <a className="btn btn-solid" href="#work">See my work</a>
          <a className="btn btn-line" href={`mailto:${profile.email}`}>Email me</a>
        </div>
      </div>

      <p className="hero-hint" aria-hidden="true">
        {touch ? "Drag across the lanes, tap to send a pulse" : "Move across the lanes, click to send a pulse"}
      </p>
    </section>
  );
}
