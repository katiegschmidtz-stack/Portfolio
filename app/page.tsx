import Counter from "@/components/Counter";
import CaseStudies from "@/components/CaseStudies";
import Chat from "@/components/Chat";
import {
  profile,
  metrics,
  caseStudies,
  strengths,
  builds,
  buildStack,
  suggestedQuestions,
  recognition,
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-inner">
          <a href="#top" className="logo">
            KS<span>.</span>
          </a>
          <nav aria-label="Main">
            <a href="#impact">Impact</a>
            <a href="#work">Work</a>
            <a href="#builds">Builds</a>
            <a href="/resume">Resume</a>
            <a href="#chat" className="btn btn-gold btn-sm">Ask my AI</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-inner">
            <div>
              <p className="eyebrow">{profile.title}</p>
              <h1>
                Hi, I&apos;m Katie. <span className="tagline"><span className="squiggle">{profile.headline}</span></span>
              </h1>
              <p className="lead">{profile.intro}</p>
              <div className="cta-row">
                <a href="#chat" className="btn btn-gold">Chat with my resume</a>
                <a href="/resume" className="btn btn-outline">View resume</a>
                <a href={`mailto:${profile.email}`} className="btn btn-link">Email me →</a>
              </div>
              <p className="meta">{profile.location}</p>
            </div>
            <div className="hero-card" aria-hidden="true">
              <div className="hero-badge">Now</div>
              <p className="hero-card-big">$13.5M</p>
              <p>value generated in one quarter by the AI platform I built from zero</p>
              <div className="hero-dots"><i /><i /><i /></div>
            </div>
          </div>
        </section>

        <section className="recognition" aria-label="Awards and recognition">
          <div className="wrap recognition-inner">
            <span className="recognition-label">Recognition</span>
            <ul>
              {recognition.map((r) => (
                <li key={r.name}>
                  {r.url ? (
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <strong>{r.name}</strong> <span>{r.detail} ↗</span>
                    </a>
                  ) : (
                    <>
                      <strong>{r.name}</strong> <span>{r.detail}</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="impact" className="section band">
          <div className="wrap">
            <h2 className="section-title">Impact, by the numbers</h2>
            <div className="metrics">
              {metrics.map((m) => (
                <Counter key={m.label} metric={m} />
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="section">
          <div className="wrap">
            <p className="eyebrow">Selected work</p>
            <h2 className="section-title">Case studies</h2>
            <CaseStudies items={caseStudies} />
          </div>
        </section>

        <section className="section navy">
          <div className="wrap">
            <p className="eyebrow">How I lead</p>
            <h2 className="section-title">What people say I bring</h2>
            <div className="strengths">
              {strengths.map((s) => (
                <figure key={s.title} className="strength">
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                  <blockquote>&ldquo;{s.quote}&rdquo;</blockquote>
                  <figcaption>{s.source}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section id="builds" className="section">
          <div className="wrap">
            <p className="eyebrow">Hands-on with AI</p>
            <h2 className="section-title">Things I&apos;ve built</h2>
            <p className="section-sub">{buildStack}. I build to stay close to what AI tools can really do.</p>
            <div className="builds">
              {builds.map((b) => {
                const inner = (
                  <>
                    <p className="build-what">{b.what}</p>
                    <h3>{b.name}</h3>
                    <p>{b.details}</p>
                    {b.url ? <span className="build-link">Visit site ↗</span> : <span className="build-link">You&apos;re here ✦</span>}
                  </>
                );
                return b.url ? (
                  <a key={b.name} href={b.url} target="_blank" rel="noopener noreferrer" className="build">
                    {inner}
                  </a>
                ) : (
                  <div key={b.name} className="build build-here">{inner}</div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="chat" className="section band">
          <div className="wrap chat-wrap">
            <div>
              <p className="eyebrow">Chat with my resume</p>
              <h2 className="section-title">Ask me anything</h2>
              <p className="section-sub">
                Short on time? This assistant knows my experience, results, and how I work. Ask it
                the questions you&apos;d ask in a first call.
              </p>
            </div>
            <Chat suggestions={suggestedQuestions} email={profile.email} />
          </div>
        </section>

        <section className="section contact">
          <div className="wrap">
            <h2 className="section-title">Let&apos;s talk</h2>
            <p className="section-sub">{profile.lookingFor}</p>
            <div className="cta-row center">
              <a href={`mailto:${profile.email}`} className="btn btn-gold">{profile.email}</a>
              {profile.linkedin && (
                <a href={profile.linkedin} className="btn btn-outline" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              )}
              <a href="/resume" className="btn btn-outline">Resume</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap">© {new Date().getFullYear()} {profile.name} · Built with Claude Code</div>
      </footer>
    </>
  );
}
