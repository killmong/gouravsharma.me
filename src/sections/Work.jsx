import { useEffect, useRef, useState } from "react";
import { projects } from "../content";

export default function Work() {
  const previewRef = useRef(null);
  const [active, setActive] = useState(null);

  // the preview image follows the cursor on devices with a fine pointer
  useEffect(() => {
    const el = previewRef.current;
    let x = 0, y = 0, cx = 0, cy = 0, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const tick = () => {
      cx += (x - cx) * 0.18;
      cy += (y - cy) * 0.18;
      if (el) el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", move);
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <section id="work" className="section wrap">
      <header className="section-head">
        <h2>Selected work</h2>
        <p>Things I've designed, built and shipped.</p>
      </header>

      <ul className="projects" onPointerLeave={() => setActive(null)}>
        {projects.map((p, i) => (
          <li
            key={p.title}
            className={`project ${active === i ? "is-active" : ""}`}
            onPointerEnter={() => setActive(i)}
          >
            <img className="project-thumb" src={p.image} alt="" loading="lazy" />
            <div className="project-main">
              <h3>
                <a href={p.live} target="_blank" rel="noopener noreferrer">{p.title}</a>
              </h3>
              <p>{p.summary}</p>
            </div>
            <p className="project-stack">{p.stack.join(", ")}</p>
            <div className="project-links">
              <a href={p.live} target="_blank" rel="noopener noreferrer">Live site</a>
              {p.code && (
                <a href={p.code} target="_blank" rel="noopener noreferrer">Source</a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className={`preview ${active !== null ? "is-on" : ""}`} ref={previewRef} aria-hidden="true">
        {projects.map((p, i) => (
          <img key={p.title} src={p.image} alt="" className={active === i ? "is-shown" : ""} />
        ))}
      </div>
    </section>
  );
}
