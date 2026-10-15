import { experience, skills } from "../content";

export function Experience() {
  return (
    <section id="experience" className="section wrap">
      <header className="section-head">
        <h2>Experience</h2>
        <p>Most recent first.</p>
      </header>

      <ol className="timeline">
        {experience.map((job) => (
          <li key={`${job.company}-${job.date}`} className="job">
            <p className="job-date">{job.date}</p>
            <div className="job-body">
              <h3>
                {job.role} <span className="job-company">at {job.company}</span>
              </h3>
              <p>{job.summary}</p>
              {job.points.length > 0 && (
                <ul className="job-points">
                  {job.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              )}
              <p className="job-stack">{job.stack}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Skills() {
  return (
    <section id="skills" className="section wrap">
      <header className="section-head">
        <h2>Tools I work with</h2>
      </header>
      <div className="skills">
        {skills.map((g) => (
          <div key={g.group} className="skill-group">
            <h3>{g.group}</h3>
            <ul>
              {g.items.map((s) => <li key={s}>{s}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
