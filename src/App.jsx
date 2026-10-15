import { useEffect, useState } from "react";
import Hero from "./sections/Hero";
import Work from "./sections/Work";
import { Experience, Skills } from "./sections/Experience";
import Contact from "./sections/Contact";
import { profile } from "./content";

function Nav() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > window.innerHeight * 0.6);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header className={`nav ${solid ? "is-solid" : ""}`}>
      <div className="wrap nav-inner">
        <a href="#top" className="nav-mark">{profile.name}</a>
        <nav aria-label="Sections">
          <a href="#work">Work</a>
          <a href="#experience">Experience</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <>
      <a className="skip" href="#work">Skip to work</a>
      <Nav />
      <main>
        <Hero />
        <Work />
        <Experience />
        <Skills />
        <Contact />
      </main>
      <footer className="footer wrap">
        <p>© {new Date().getFullYear()} {profile.name}, {profile.location}</p>
        <ul>
          {profile.links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
            </li>
          ))}
        </ul>
      </footer>
    </>
  );
}
