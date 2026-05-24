import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

/* ───────────── icon helpers (inline SVGs) ───────────── */

const PlayIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/* ─── service‑card icons ─── */

const ComplaintIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const TrackingIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const LostFoundIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
    <line x1="11" y1="8" x2="11" y2="14" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const SupportIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ArrowRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

/* ─── How-it-works step icons ─── */

const SubmitIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const RouteIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3" />
    <circle cx="6" cy="6" r="3" />
    <path d="M13 6h3a2 2 0 0 1 2 2v7" />
    <path d="M6 9v12" />
  </svg>
);

const LiveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </svg>
);

const AdminIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <polyline points="9 12 11 14 15 10" />
  </svg>
);

const FeedbackIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="9" y1="10" x2="9.01" y2="10" />
    <line x1="12" y1="10" x2="12.01" y2="10" />
    <line x1="15" y1="10" x2="15.01" y2="10" />
  </svg>
);

/* ─── Flow arrow connector ─── */
const FlowArrow = () => (
  <div className="hiw__arrow" aria-hidden="true">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  </div>
);

/* ─── Social icons for footer ─── */
const LinkedInIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const InstagramIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
/*                              LANDING PAGE                                 */
/* ═══════════════════════════════════════════════════════════════════════════ */

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const services = [
    {
      Icon: ComplaintIcon,
      title: "File Complaints",
      desc: "Easily submit and manage complaints with a streamlined form. Attach details, set priority, and get instant confirmation.",
    },
    {
      Icon: TrackingIcon,
      title: "Real‑Time Tracking",
      desc: "Track the status of every complaint in real time. Get notified at each stage from submission to resolution.",
    },
    {
      Icon: LostFoundIcon,
      title: "Lost & Found",
      desc: "Report lost items or found belongings. Our smart matching system helps reunite owners with their possessions quickly.",
    },
    {
      Icon: SupportIcon,
      title: "24/7 Support",
      desc: "Round‑the‑clock assistance ensuring your issues are heard and addressed promptly, day and night, without interruption.",
    },
  ];

  const steps = [
    { Icon: SubmitIcon,   title: "Submit a Complaint",    tag: "Step 01", badge: "5 Min",  desc: "File your issue in seconds. Attach supporting details, choose a category, and receive an instant confirmation with a unique tracking ID." },
    { Icon: RouteIcon,    title: "Complaint Verification", tag: "Step 02", badge: "Auto",   desc: "Our system verifies and validates your submission, ensuring it is routed to the correct department with full context and priority level." },
    { Icon: LiveIcon,     title: "Real-Time Tracking",     tag: "Step 03", badge: "24/7",   desc: "Monitor your complaint\u2019s live status through a transparent progress dashboard. Get notified at every stage \u2014 from review to resolution." },
    { Icon: AdminIcon,    title: "Resolution Process",     tag: "Step 04", badge: "Action", desc: "Admins take swift, accountable action. Complaints are reviewed, prioritized, and resolved with full audit trails for transparency." },
    { Icon: FeedbackIcon, title: "Feedback & Closure",     tag: "Step 05", badge: "Done",   desc: "Once resolved, you receive a full closure report. Share your feedback to help us improve \u2014 your voice drives continuous improvement." },
  ];


  return (
    <div className="landing-root">
      {/* ── Soft background blobs ── */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav
        id="landing-navbar"
        className={`landing-nav ${scrolled ? "landing-nav--scrolled" : ""}`}
      >
        <div className="landing-nav__inner">
          <a href="#home" className="landing-nav__logo" id="navbar-logo">
            <img src="/logo.svg" alt="ComplaintUs logo" className="landing-nav__logo-img" />
            <span className="landing-nav__logo-text">ComplaintUs</span>
          </a>

          <ul className="landing-nav__links" id="navbar-links">
            {navLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} className="landing-nav__link">{l.label}</a>
              </li>
            ))}
          </ul>

          <div className="landing-nav__actions" id="navbar-actions">
            <button className="btn btn--ghost" id="btn-signup" onClick={() => navigate("/register")}>
              Sign Up
            </button>
            <button className="btn btn--yellow" id="btn-free-trial" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>

          <button
            className="landing-nav__hamburger"
            id="navbar-hamburger"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="landing-nav__mobile" id="navbar-mobile">
            <ul>
              {navLinks.map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="landing-nav__link" onClick={() => setMobileMenuOpen(false)}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="landing-nav__mobile-actions">
              <button className="btn btn--ghost" onClick={() => navigate("/register")}>Sign Up</button>
              <button className="btn btn--primary" onClick={() => navigate("/login")}>Login</button>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="hero" id="home">

        {/* ── Concentric rings background ── */}
        <div className="hero__rings" aria-hidden="true">
          {/* 1800×1800 viewBox, center 900,900 — inner rings fully visible, outer rings elegantly clipped */}
          <svg viewBox="0 0 1800 1800" fill="none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <circle className="ring-1" cx="900" cy="900" r="90" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-2" cx="900" cy="900" r="175" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-3" cx="900" cy="900" r="260" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-4" cx="900" cy="900" r="345" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-5" cx="900" cy="900" r="430" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-6" cx="900" cy="900" r="515" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-7" cx="900" cy="900" r="600" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-8" cx="900" cy="900" r="685" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-9" cx="900" cy="900" r="770" stroke="#34d399" strokeWidth="1" />
            <circle className="ring-10" cx="900" cy="900" r="855" stroke="#34d399" strokeWidth="1" />
          </svg>
        </div>

        <div className="hero__container">
          <div className="hero__text">
            <h1 className="hero__title" id="hero-title">
              Report issues,
              <br />& <span className="hero__highlight">resolve</span> them
              faster.
            </h1>
            <p className="hero__desc" id="hero-desc">
              A seamless platform to file complaints, track lost & found items,
              and get real‑time updates — all in one place. Your concerns
              deserve quick action and transparent resolution.
            </p>
            <div className="hero__ctas" id="hero-ctas">
              <button className="btn btn--yellow btn--lg" id="btn-get-started" onClick={() => navigate("/register")}>
                Get Started
              </button>
              <button className="btn btn--outline btn--lg" id="btn-how-it-works" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                <PlayIcon /> How it works
              </button>
            </div>
          </div>

          <div className="hero__visual" id="hero-visual">
            <div className="hero__img-wrapper">
              <img src="/hero-illustration.png" alt="ComplaintUs complaint management illustration" className="hero__img" loading="eager" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES ═══════════════ */}
      <section className="services" id="services">
        <div className="services__header">
          <h2 className="services__title" id="services-title">
            Our Included <span className="hero__highlight">Services</span>.
          </h2>
          <p className="services__subtitle">
            From filing a complaint to tracking its resolution — everything
            you need for a hassle‑free experience.
          </p>
        </div>
        <div className="services__grid" id="services-grid">
          {services.map((s, idx) => (
            <div
              key={s.title}
              className="service-card"
              id={`service-card-${idx}`}
              style={{ "--delay": `${idx * 0.1}s` }}
            >
              <div className="service-card__icon">
                <s.Icon />
              </div>
              <h3 className="service-card__title">{s.title}</h3>
              <p className="service-card__desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="hiw" id="how-it-works">
        <div className="hiw__header">
          <span className="services__eyebrow">The Process</span>
          <h2 className="hiw__title">
            How <span className="hero__highlight">ComplaintUs</span> Works
          </h2>
          <p className="hiw__subtitle">
            A seamless five-step workflow designed for speed, transparency, and efficient resolution.
          </p>
        </div>

        <div className="hiw__grid">
          {steps.map((step, idx) => {
            const isOdd = idx % 2 === 0; // 0,2,4 → left col; 1,3 → right col
            return (
              <div key={step.tag} className="hiw__row">
                {/* Card — placed in left or right column */}
                <div
                  className={`hiw__card-wrap ${
                    isOdd ? "hiw__card-wrap--left" : "hiw__card-wrap--right"
                  } hiw__card-wrap--${isOdd ? "mint" : "white"}`}
                  id={`hiw-step-${idx}`}
                  style={{ "--delay": `${idx * 0.1}s` }}
                >
                  {/* Vertical pill badge */}
                  <div className={`hiw__pill hiw__pill--${isOdd ? "green" : "dark"}`}
                    aria-label={`Duration: ${step.badge}`}>
                    <span>{step.badge}</span>
                  </div>

                  {/* Main content */}
                  <div className="hiw__card-body">
                    <div className="hiw__card-header">
                      <div className="hiw__card-icon" aria-hidden="true">
                        <step.Icon />
                      </div>
                      <span className="hiw__step-tag">{step.tag}</span>
                    </div>
                    <h3 className="hiw__step-title">{step.title}</h3>
                    <p className="hiw__step-desc">{step.desc}</p>
                  </div>
                </div>

                {/* Connector arc to next step */}
                {idx < steps.length - 1 && (
                  <div
                    className={`hiw__arc hiw__arc--${
                      isOdd ? "right" : "left"
                    }`}
                    aria-hidden="true"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════ ABOUT ═══════════════ */}
      <section className="about" id="about">
        <div className="about__container">
          {/* Left – text */}
          <div className="about__text">
            <span className="services__eyebrow">Who We Are</span>
            <h2 className="about__title">
              About <span className="hero__highlight">ComplaintUs</span>
            </h2>
            <p className="about__paragraph">
              ComplaintUs is a modern grievance and complaint management platform
              built to simplify issue reporting, tracking, and resolution. Our
              platform enables organizations, institutions, and communities to
              manage complaints transparently while ensuring faster
              communication between users and administrators.
            </p>
            <p className="about__paragraph">
              With real‑time tracking, smart complaint routing, and an intuitive
              user experience, ComplaintUs improves accountability and streamlines
              operations for both users and management teams.
            </p>
            <p className="about__paragraph">
              Whether for enterprises, colleges, workplaces, or communities,
              ComplaintUs ensures every concern is heard and resolved efficiently.
            </p>
            <div className="about__ctas">
              <button className="btn btn--primary btn--lg" id="btn-about-get-started" onClick={() => navigate("/register")}>
                Get Started
              </button>
            </div>
          </div>

          {/* Right – dashboard mockup */}
          <div className="about__visual" id="about-visual">
            <div className="about__img-wrapper">
              <img
                src="/about-illustration.png"
                alt="ComplaintUs team resolving complaints and managing grievances"
                className="about__img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="footer" id="contact">
        <div className="footer__inner">
          {/* Col 1 – Brand */}
          <div className="footer__brand">
            <a href="#home" className="footer__logo">
              <img src="/logo.svg" alt="ComplaintUs" className="footer__logo-img" />
              <span className="footer__logo-text">ComplaintUs</span>
            </a>
            <p className="footer__tagline">
              Smart Complaint & Grievance Resolution Platform
            </p>
          </div>

          {/* Col 2 – Quick Links */}
          <div className="footer__col">
            <h4 className="footer__col-title">Quick Links</h4>
            <ul className="footer__links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#services">Resources</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Col 3 – Contact */}
          <div className="footer__col">
            <h4 className="footer__col-title">Contact Us</h4>
            <ul className="footer__links footer__contact-list">
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                <a href="mailto:support@complaintus.com">support@complaintus.com</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                <a href="tel:+919876543210">+91 98765 43210</a>
              </li>
              <li>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span>Gurugram, Haryana, India</span>
              </li>
            </ul>
            <div className="footer__socials">
              <a href="#" aria-label="LinkedIn" className="footer__social-icon"><LinkedInIcon /></a>
              <a href="#" aria-label="Instagram" className="footer__social-icon"><InstagramIcon /></a>
              <a href="#" aria-label="Twitter / X" className="footer__social-icon"><TwitterIcon /></a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer__bottom">
          <p>© 2026 ComplaintUs. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
