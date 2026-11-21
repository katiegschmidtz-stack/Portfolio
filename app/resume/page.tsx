import type { Metadata } from "next";
import PrintButton from "@/components/PrintButton";
import { profile, experience, skills, education, recognition } from "@/lib/content";

export const metadata: Metadata = {
  title: "Resume · Katie Schmidtz",
};

export default function Resume() {
  return (
    <main className="resume">
      <div className="resume-actions no-print">
        <a href="/" className="btn btn-link">← Back to site</a>
        <PrintButton />
      </div>
      <header className="resume-head">
        <h1>{profile.name}</h1>
        <p className="resume-title">{profile.title}</p>
        <p className="resume-contact">
          <a href={`mailto:${profile.email}`}>{profile.email}</a> · {profile.location}
          {profile.linkedin && <> · <a href={profile.linkedin}>LinkedIn</a></>}
        </p>
      </header>

      <section>
        <h2>Summary</h2>
        <p>{profile.intro}</p>
      </section>

      <section>
        <h2>Experience</h2>
        {experience.map((e) => (
          <div key={e.role + e.dates} className="resume-job">
            <div className="resume-job-head">
              <h3>{e.role} · <span>{e.org}</span></h3>
              <span className="resume-dates">{e.dates}</span>
            </div>
            {e.points.length > 0 && (
              <ul>
                {e.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        <dl className="resume-skills">
          {skills.map((s) => (
            <div key={s.group}>
              <dt>{s.group}</dt>
              <dd>{s.items.join(" · ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section>
        <h2>Recognition</h2>
        <ul>
          {recognition.map((r) => (
            <li key={r.name}>
              {r.url ? <a href={r.url}>{r.name}</a> : r.name}, {r.detail}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Education & development</h2>
        <ul>
          {education.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
