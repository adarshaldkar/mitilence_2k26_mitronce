import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ChessboardBg from '../components/ChessboardBg';
import './Home.css';

// ═══════════════════════════════════════════
// Event Data
// ═══════════════════════════════════════════
const EVENTS = [
  {
    name: 'Paper Presentation',
    category: 'technical',
    icon: 'fas fa-file-alt',
    short: 'Present innovative research papers on ECE domains like Communication, VLSI, IoT & AI.',
    desc: 'Present innovative ideas or research papers related to Electronics and Communication domains such as Communication Systems, Embedded Systems, VLSI, IoT, Signal Processing, Artificial Intelligence in Electronics, and Networking.',
    teamSize: 'Max 2 members',
    rules: '10 min total (8 min presentation + 2 min Q&A), PPT format, original work only, no plagiarism. Submit paper to mitilmitronce26@gmail.com before 12.03.2026.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Connectify',
    category: 'technical',
    icon: 'fas fa-project-diagram',
    short: 'Identify connections between technical terms, components, and technologies.',
    desc: 'A technical networking challenge where participants must identify connections between technical terms, electronic components, technologies, or concepts. Test your lateral thinking and technical knowledge!',
    teamSize: 'Max 2 members',
    rules: '2 rounds (Qualification + Final). Identify connections between given clues or images. Questions related to electronics, technology, and logical connections. No electronic gadgets allowed.',
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Bot Marathon',
    category: 'technical',
    icon: 'fas fa-robot',
    short: 'Design and operate a bot to navigate through an arena in the shortest time.',
    desc: 'A robotics event where participants design and operate a bot that navigates through a given track or arena. The objective is to complete the course in the shortest possible time while following the rules of the competition.',
    teamSize: 'Max 3 members',
    rules: '2 rounds. Teams must operate only one bot throughout. Shortest time wins. 5-second bonus time for stops/deviations. Any arena damage leads to disqualification.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Sustainable Concept Pitch',
    category: 'technical',
    icon: 'fas fa-leaf',
    short: 'Pitch innovative sustainable ideas addressing environmental or societal problems.',
    desc: 'Participants should pitch innovative sustainable ideas or technological solutions that address environmental or societal problems. Present using PPT, prototype, or visual aids.',
    teamSize: 'Max 2 members',
    rules: '5 min pitch + 2 min Q&A. Concept must be original and practically feasible. Evaluated on innovation, feasibility, impact, and presentation skills.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Mindbender',
    category: 'technical',
    icon: 'fas fa-brain',
    short: 'Solve puzzles, riddles, and analytical problem-solving tasks.',
    desc: 'A logical and analytical challenge where participants solve puzzles, riddles, and problem-solving tasks. The competition consists of quiz and puzzle solving rounds conducted within a specified time limit.',
    teamSize: 'Individual',
    rules: 'Timed rounds. Scoring based on correct answers (negative marks may apply). No mobile phones, calculators, or electronic gadgets. Fastest and most accurate participant wins.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Bug Busters',
    category: 'technical',
    icon: 'fas fa-bug',
    short: 'Identify and fix errors in code snippets across multiple languages.',
    desc: 'A debugging contest where participants must identify and fix errors in given code snippets. Programming languages may include C, Embedded C, Python, and Java.',
    teamSize: 'Max 2 members',
    rules: '2 rounds — Round 1: Error Identification, Round 2: Debugging. Time limit: 30 minutes. No external resources or internet. Team solving the most bugs correctly wins.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Code Clash in Embedded C',
    category: 'technical',
    icon: 'fas fa-microchip',
    short: 'Write efficient Embedded C programs to solve hardware-oriented problem statements.',
    desc: 'A technical coding event where participants must write efficient Embedded C programs to solve given hardware-oriented tasks or problem statements related to embedded systems. Solutions must consider constraints like limited memory and processing capability.',
    teamSize: 'Max 2 members',
    rules: 'Only C language allowed. Evaluated on correctness, efficiency & optimization. No external tools, libraries, or internet. Judges\' decision is final.',
    
    prize: '🏆 Exciting Prizes',
  },
  {
    name: 'Fun Zone',
    category: 'fun-zone',
    icon: 'fas fa-gamepad',
    short: 'Entertaining mini games — Chess Competition, Blind Nit, Push Up Challenge & Win the Doll!',
    desc: 'Fun Zone includes a variety of entertaining mini games and interactive activities for all participants. Events include Chess Competition, Blind Nit, Push Up Challenge, and Win the Doll!',
    teamSize: 'Individual',
    rules: 'Each game has separate rules explained before start. Follow coordinator instructions. Misconduct leads to disqualification. Winners selected on performance & time.',
    prize: '🎉 Fun Prizes',
  },
];

const SCHEDULE = [
  { time: '9:00 AM', title: 'Registration', desc: 'Check-in, kit distribution, and welcome refreshments.', icon: 'fas fa-chess-pawn' },
  { time: '9:30 AM', title: 'Inauguration', desc: 'Opening ceremony with chief guest address and lamp lighting.', icon: 'fas fa-chess-king' },
  { time: '11:00 AM – 12:30 PM', title: 'Paper Presentation', desc: 'Research paper presentations on ECE domains — Communication, VLSI, IoT & AI.', icon: 'fas fa-chess-bishop' },
  { time: '2:00 PM – 3:30 PM', title: 'Connectify', desc: 'Technical networking challenge — identify connections between components & concepts.', icon: 'fas fa-chess-knight' },
  { time: '12:00 PM – 2:30 PM', title: 'Bot Marathon', desc: 'Robotics event — navigate your bot through the arena in the shortest time.', icon: 'fas fa-chess-rook' },
  { time: '2:00 PM – 3:00 PM', title: 'Mindbender', desc: 'Solve puzzles, riddles, and analytical problem-solving challenges.', icon: 'fas fa-chess-queen' },
  { time: '1:00 PM – 2:30 PM', title: 'Bug Busters', desc: 'Debugging contest — find and fix errors in code across multiple languages.', icon: 'fas fa-chess-pawn' },
  { time: '1:00 PM', title: 'Lunch Break', desc: 'Networking lunch and refreshments for all participants.', icon: 'fas fa-chess-king' },
  { time: '1:00 PM – 2:30 PM', title: 'Sustainable Concept Pitch', desc: 'Pitch innovative sustainable ideas for environmental or societal impact.', icon: 'fas fa-chess-bishop' },
  { time: '11:00 AM – 12:30 PM', title: 'Code Clash in Embedded C', desc: 'Write efficient Embedded C programs to solve hardware-oriented challenges.', icon: 'fas fa-chess-knight' },
  { time: '11:00 AM – 3:30 PM', title: 'Fun Zone', desc: 'Mini games — Chess Competition, Blind Hit, Push Up Challenge & Win the Doll!', icon: 'fas fa-chess-rook' },
  { time: '4:30 PM', title: 'Valediction', desc: 'Prize distribution, closing ceremony, and vote of thanks.', icon: 'fas fa-chess-king' },
];

const WHY_CARDS = [
  { icon: 'fas fa-brain', title: 'Cutting-Edge Technical Challenges', desc: 'Push the boundaries of your technical knowledge with industry-relevant challenges in AI, IoT, and embedded systems.', piece: '♞' },
  { icon: 'fas fa-handshake', title: 'Network with Innovators', desc: 'Connect with like-minded tech enthusiasts, industry professionals, and brilliant minds from over 50 colleges.', piece: '♜' },
  { icon: 'fas fa-trophy', title: 'Win Prizes & Recognition', desc: 'Compete for a prize pool of ₹50,000+ along with certificates, trophies, and prestigious recognition.', piece: '♛' },
  { icon: 'fas fa-lightbulb', title: 'Enhance Problem-Solving Skills', desc: 'Sharpen your analytical thinking, teamwork, and problem-solving abilities through hands-on events.', piece: '♝' },
];

// (Old 2D chessboard canvas removed — replaced by Three.js ChessboardBg component)

// Hero-only particle system (kept for the hero section)
const useHeroParticles = (canvasRef) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, animId;
    let mouse = { x: -9999, y: -9999 };
    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 120;
    const particles = [];
    const rand = (min, max) => Math.random() * (max - min) + min;

    const resize = () => {
      width = canvas.width = canvas.parentElement.offsetWidth;
      height = canvas.height = canvas.parentElement.offsetHeight;
    };

    class Particle {
      constructor(initial = false) {
        this.x = rand(0, width);
        this.y = initial ? rand(0, height) : height + rand(10, 60);
        this.size = rand(1.2, 3.5);
        this.speedY = rand(0.2, 0.9);
        this.drift = rand(0.3, 1.2);
        this.phase = rand(0, Math.PI * 2);
        this.opacity = rand(0.25, 0.85);
        this.gold = Math.random() > 0.5 ? '#C6A15B' : '#E6C47A';
      }
      reset() {
        this.x = rand(0, width);
        this.y = height + rand(10, 60);
        this.size = rand(1.2, 3.5);
        this.speedY = rand(0.2, 0.9);
      }
      update() {
        this.y -= this.speedY;
        this.x += Math.sin(this.phase) * this.drift * 0.3;
        this.phase += 0.008;
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const force = (100 - dist) / 100;
          this.x += (dx / dist) * force * 2.5;
          this.y += (dy / dist) * force * 2.5;
        }
        if (this.y < -10 || this.x < -20 || this.x > width + 20) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.gold;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    resize();
    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle(true));

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(198,161,91,${(1 - dist / CONNECTION_DIST) * 0.2})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawConnections();
      animId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const handleMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [canvasRef]);
};

// ═══════════════════════════════════════════
// Typing Effect Hook
// ═══════════════════════════════════════════
const useTypingEffect = (text, speed = 50, delay = 800) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let index = 0;
    let timeout;
    const type = () => {
      if (index < text.length) {
        setDisplayed(text.slice(0, index + 1));
        index++;
        timeout = setTimeout(type, speed + Math.random() * 35);
      }
    };
    timeout = setTimeout(type, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);
  return displayed;
};

// ═══════════════════════════════════════════
// Counter Animation Hook
// ═══════════════════════════════════════════
const useCounterAnimation = (target, duration = 2000) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
      else setCount(target);
    };
    requestAnimationFrame(tick);
  }, [started, target, duration]);

  return { count, ref };
};

// ═══════════════════════════════════════════
// Scroll Animation Hook
// ═══════════════════════════════════════════
const useScrollAnimation = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
};

// ═══════════════════════════════════════════
// Stat Card Component
// ═══════════════════════════════════════════
const StatCard = ({ icon, target, prefix, suffix, label }) => {
  const { count, ref } = useCounterAnimation(target);
  return (
    <div className="stat-card" ref={ref}>
      <div className="stat-icon"><i className={icon} /></div>
      <h3 className="stat-number">{prefix}{count}{suffix}</h3>
      <p className="stat-label">{label}</p>
    </div>
  );
};

// ═══════════════════════════════════════════
// Event Card Component (Horizontal Flip)
// ═══════════════════════════════════════════
const CATEGORY_LABELS = { technical: 'Technical Event', 'fun-zone': 'Fun Zone' };

const EventCard = ({ event }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      className={`event-card${flipped ? ' flipped' : ''}`}
      data-category={event.category}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="event-card-inner">
        {/* FRONT — Event Image / Visual */}
        <div className="event-card-front">
          <div className="event-card-category-badge">
            {CATEGORY_LABELS[event.category] || event.category}
          </div>
          <div className="event-card-poster">
            <div className="event-poster-placeholder">
              <i className={event.icon} />
            </div>
          </div>
          <div className="event-card-info">
            <h3 className="event-card-title">{event.name}</h3>
            <p className="event-card-short">{event.short}</p>
            <span className="event-card-flip-hint">
              <i className="fas fa-sync-alt" /> Tap to see rules
            </span>
          </div>
        </div>
        {/* BACK — Rules & Regulations */}
        <div className="event-card-back">
          <div className="event-card-back-header">
            <i className={event.icon + ' event-card-back-icon'} />
            <h3 className="event-card-back-title">{event.name}</h3>
          </div>
          <div className="event-card-back-divider" />
          <h4 className="event-card-rules-heading">Rules & Regulations</h4>
          <p className="event-card-back-desc">{event.desc}</p>
          <ul className="event-card-details">
            <li><i className="fas fa-users" /> <strong>Team Size:</strong> {event.teamSize}</li>
            <li><i className="fas fa-gavel" /> <strong>Rules:</strong> {event.rules}</li>
            <li><i className="fas fa-trophy" /> <strong>Prize:</strong> {event.prize}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Timeline Item Component
// ═══════════════════════════════════════════
const TimelineItem = ({ item, index }) => {
  const ref = useRef(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setActive(true), index * 200);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div ref={ref} className={`timeline-item${active ? ' active' : ''}`}>
      <div className="timeline-marker">
        <i className={item.icon} />
      </div>
      <div className="timeline-content">
        <span className="timeline-time">{item.time}</span>
        <h3 className="timeline-title">{item.title}</h3>
        <p className="timeline-desc">{item.desc}</p>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════
// Section Wrapper with scroll animation
// ═══════════════════════════════════════════
const AnimatedSection = ({ children, className }) => {
  const { ref, visible } = useScrollAnimation();
  return (
    <div ref={ref} className={`animate-on-scroll${visible ? ' visible' : ''} ${className || ''}`}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════
// Main Home Component
// ═══════════════════════════════════════════
const Home = () => {
  const heroCanvasRef = useRef(null);
  const carouselRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Hero particle canvas
  useHeroParticles(heroCanvasRef);

  // Typing effect for hero subtitle
  const subtitleText = useTypingEffect('National Level Technical Symposium');

  // Back to top visibility
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel scroll
  const scrollCarousel = useCallback((direction) => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const card = carousel.querySelector('.event-card');
    if (!card) return;
    const gap = parseInt(getComputedStyle(carousel).gap) || 24;
    const amount = card.offsetWidth + gap;
    carousel.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    let interval = setInterval(() => {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      if (carousel.scrollLeft >= maxScroll - 10) {
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        const card = carousel.querySelector('.event-card');
        const gap = parseInt(getComputedStyle(carousel).gap) || 24;
        carousel.scrollBy({ left: (card?.offsetWidth || 320) + gap, behavior: 'smooth' });
      }
    }, 5000);

    const pause = () => clearInterval(interval);
    const resume = () => {
      clearInterval(interval);
      interval = setInterval(() => {
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        if (carousel.scrollLeft >= maxScroll - 10) {
          carousel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const card = carousel.querySelector('.event-card');
          const gap = parseInt(getComputedStyle(carousel).gap) || 24;
          carousel.scrollBy({ left: (card?.offsetWidth || 320) + gap, behavior: 'smooth' });
        }
      }, 5000);
    };

    carousel.addEventListener('mouseenter', pause);
    carousel.addEventListener('mouseleave', resume);
    return () => {
      clearInterval(interval);
      carousel.removeEventListener('mouseenter', pause);
      carousel.removeEventListener('mouseleave', resume);
    };
  }, []);

  // Filter events
  const filteredEvents = activeFilter === 'all'
    ? EVENTS
    : EVENTS.filter(e => e.category === activeFilter);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="home-page-wrapper">
      {/* ═══ THREE.JS CHESSBOARD BACKGROUND ═══ */}
      <ChessboardBg />

      {/* ═══ HERO SECTION ═══ */}
      <section className="hero-section" id="home">
        <canvas ref={heroCanvasRef} className="hero-canvas" />
        <div className="hero-overlay">
          <div className="hero-content">
            <p className="hero-subtitle">{subtitleText}</p>
            <h1 className="hero-title">MITRONCE <span>2026</span></h1>
            <p className="hero-department">ECE Department</p>
            <div className="hero-divider">
              <span className="divider-line" />
              <span className="divider-icon">&#9818;</span>
              <span className="divider-line" />
            </div>
            <div className="hero-buttons">
              <a href="#events" className="btn btn-primary">
                <i className="fas fa-chess-knight" /> Enter The Game
              </a>
              <a href="#events" className="btn btn-secondary">
                <i className="fas fa-compass" /> Explore Events
              </a>
            </div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span className="scroll-text">Scroll Down</span>
          <div className="scroll-arrow">
            <i className="fas fa-chevron-down" />
          </div>
        </div>
      </section>

      {/* ═══ ABOUT SECTION ═══ */}
      <section className="about-section" id="about">
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">ABOUT MITRONCE</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <p className="about-description">
              MITRONCE 2026 is a prestigious National Level Technical Symposium organized by the Department of Electronics and Communication Engineering. Inspired by the strategic brilliance of chess, MITRONCE brings together the brightest minds from across the nation to compete, innovate, and conquer in a series of intellectually stimulating technical and non-technical events. With a legacy of excellence, this symposium serves as the ultimate battleground where knowledge meets strategy, creativity meets precision, and participants transform into champions.
            </p>
          </AnimatedSection>

          <AnimatedSection>
            <div className="about-stats">
              <StatCard icon="fas fa-users" target={500} prefix="" suffix="+" label="Participants" />
              <StatCard icon="fas fa-trophy" target="Exciting Gifts & Cash Prizes" prefix="" suffix="" label="Prize Pool" />
              <StatCard icon="fas fa-calendar-alt" target={10} prefix="" suffix="+" label="Events" />
              <StatCard icon="fas fa-university" target={50} prefix="" suffix="+" label="Colleges" />
            </div>
          </AnimatedSection>

          <div className="gold-divider-bottom" />
        </div>
      </section>

      {/* ═══ EVENTS SECTION ═══ */}
      <section className="events-section" id="events">
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">DISCOVER THE BATTLEFIELDS</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="events-filter">
              {[
                { label: 'All Events', value: 'all' },
                { label: 'Technical Events', value: 'technical' },
                { label: 'Fun Zone', value: 'fun-zone' },
              ].map(f => (
                <button
                  key={f.value}
                  className={`filter-btn${activeFilter === f.value ? ' active' : ''}`}
                  onClick={() => setActiveFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="events-carousel-wrapper">
              <button className="carousel-arrow" onClick={() => scrollCarousel(-1)} aria-label="Scroll left">
                <i className="fas fa-chevron-left" />
              </button>
              <div className="events-carousel" ref={carouselRef}>
                {filteredEvents.map(event => (
                  <EventCard key={event.name} event={event} />
                ))}
              </div>
              <button className="carousel-arrow" onClick={() => scrollCarousel(1)} aria-label="Scroll right">
                <i className="fas fa-chevron-right" />
              </button>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="register-cta-section">
              <div className="register-cta-note">
                <i className="fas fa-info-circle" />
                <span><strong>On-spot registration</strong> and <strong>Pre-booking</strong> both available!</span>
              </div>
              <Link to="/register" className="btn-register-cta">
                <i className="fas fa-chess-knight" /> Pre-book Now
              </Link>
              <p style={{
                marginTop: '10px',
                fontSize: '0.82rem',
                color: 'rgba(198,161,91,0.75)',
                fontFamily: "'Raleway', sans-serif",
                letterSpacing: '0.3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <i className="fas fa-coins" style={{ color: '#C6A15B' }} />
                Pay <strong style={{ color: '#C6A15B' }}>₹200 per person</strong> — one payment, join any event or competition!
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ SCHEDULE SECTION ═══ */}
      <section className="schedule-section" id="schedule">
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">EVENT SCHEDULE</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <div className="timeline">
            {SCHEDULE.map((item, index) => (
              <TimelineItem key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHY MITRONCE SECTION ═══ */}
      <section className="why-section" id="why">
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">WHY PARTICIPATE IN MITRONCE</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="why-grid">
              {WHY_CARDS.map(card => (
                <div key={card.title} className="why-card">
                  <div className="why-card-icon"><i className={card.icon} /></div>
                  <h3 className="why-card-title">{card.title}</h3>
                  <p className="why-card-desc">{card.desc}</p>
                  <div className="why-card-chess-piece">{card.piece}</div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>


      {/* ═══ POSTER GALLERY SECTION ═══ */}
      <section className="gallery-section" id="gallery" style={{ padding: '80px 0' }}>
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">EVENT POSTERS</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 360px)',
              gap: '20px',
              justifyContent: 'center',
              marginTop: '16px',
            }}>
              {Array.from({ length: 1 }).map((_, i) => (
                <div
                  key={i}
                  onClick={() => document.getElementById('poster-lightbox').style.display = 'flex'}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(198,161,91,0.25)',
                    cursor: 'pointer',
                    aspectRatio: '3/4',
                    background: '#111',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'scale(1.04)';
                    e.currentTarget.style.boxShadow = '0 0 28px rgba(198,161,91,0.35)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <img
                    src="/main_poster.jpg"
                    alt={`MITRONCE 2026 Poster ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
                    padding: '14px',
                  }}>
                    <span style={{
                      fontFamily: 'Cinzel, serif',
                      fontSize: '0.72rem',
                      color: '#C6A15B',
                      letterSpacing: '2px',
                    }}>
                      <i className="fas fa-expand" style={{ marginRight: 6 }} />
                      View
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Lightbox */}
      <div
        id="poster-lightbox"
        onClick={() => document.getElementById('poster-lightbox').style.display = 'none'}
        style={{
          display: 'none',
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(0,0,0,0.92)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <img src="/main_poster.jpg" alt="MITRONCE 2026 Poster" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: '8px', boxShadow: '0 0 60px rgba(198,161,91,0.3)' }} />
        <button onClick={() => document.getElementById('poster-lightbox').style.display = 'none'} style={{
          position: 'absolute', top: 24, right: 32,
          background: 'transparent', border: 'none', color: '#C6A15B',
          fontSize: '2rem', cursor: 'pointer',
        }}>✕</button>
      </div>

      {/* ═══ CONTACT SECTION ═══ */}
      <section className="contact-section" id="contact">
        <div className="home-container">
          <AnimatedSection>
            <div className="section-header">
              <div className="gold-divider-left" />
              <h2 className="section-title">CONTACT US</h2>
              <div className="gold-divider-right" />
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="contact-grid">
              <div className="contact-info">
                <div className="contact-info-card">
                  <div className="contact-icon"><i className="fas fa-envelope" /></div>
                  <div>
                    <h3 className="contact-label">Email</h3>
                    <p className="contact-value"><a href="mailto:mitlienceece26@gmail.com">mitlienceece26@gmail.com</a></p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <div className="contact-icon"><i className="fas fa-phone-alt" /></div>
                  <div>
                    <h3 className="contact-label">Phone Numbers</h3>
                    <p className="contact-value"><a href="tel:+917598194196">+91 7598 194 196</a></p>
                    <p className="contact-value"><a href="tel:+919894184602">+91 9894 184 602</a></p>
                    <p className="contact-value"><a href="tel:+917010664806">+91 7010 664 806</a></p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <div className="contact-icon"><i className="fas fa-user-graduate" /></div>
                  <div>
                    <h3 className="contact-label">Student Coordinator</h3>
                    <p className="contact-value">Neraimathy P <a href="tel:+917598194196">+91 7598 194 196</a></p>
                  </div>
                </div>
                <div className="contact-info-card">
                  <div className="contact-icon"><i className="fas fa-chalkboard-teacher" /></div>
                  <div>
                    <h3 className="contact-label">Faculty Coordinator</h3>
                    <p className="contact-value">Rajesh V <a href="tel:+919894184602">+91 9894 184 602</a></p>
                  </div>
                </div>
              </div>

              <div className="contact-map">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3903.6!2d79.6243358!3d11.9226737!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5358e064c07657%3A0x2e53db2890f095ea!2sManakula%20Vinayagar%20Institute%20of%20Technology!5e0!3m2!1sen!2sin!4v1700000000000"
                  width="100%"
                  height="450"
                  style={{ border: 0, borderRadius: 12 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Manakula Vinayagar Institute of Technology"
                />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="home-footer" id="footer">
        <div className="footer-gold-divider" />
        <div className="home-container footer-content">
          <div className="footer-grid">
            <div className="footer-col footer-col-brand">
              <div className="footer-brand">
                <span className="footer-brand-icon">&#9818;</span>
                <span className="footer-brand-text">MITRONCE</span>
              </div>
              <p className="footer-brand-subtitle">ECE Technical Symposium</p>
              <p className="footer-tagline">Strategize. Innovate. Dominate.</p>
              <a href="https://www.instagram.com/mitronce_2026?igsh=MTkzb3M4MzF5bjF3bA==" target="_blank" rel="noopener noreferrer" className="footer-insta-btn">
                <i className="fab fa-instagram footer-insta-icon" />
                <span>Follow on Instagram</span>
              </a>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Quick Links</h3>
              <div className="footer-col-divider" />
              <ul className="footer-links" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li><a href="#home"><i className="fas fa-chevron-right" /> Home</a></li>
                <li><a href="#events"><i className="fas fa-chevron-right" /> Events</a></li>
                <li><a href="#contact"><i className="fas fa-chevron-right" /> Contact</a></li>
                <li><Link to="/login"><i className="fas fa-chevron-right" /> Login</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">Contact Info</h3>
              <div className="footer-col-divider" />
              <ul className="footer-contact-list">
                <li>
                  <i className="fas fa-envelope" />
                  <a href="mailto:mitlienceece26@gmail.com">mitlienceece26@gmail.com</a>
                </li>
                <li>
                  <i className="fas fa-phone-alt" />
                  <a href="tel:+917598194196">+91 7598 194 196</a>
                </li>
                <li>
                  <i className="fas fa-map-marker-alt" />
                  <span>Department of ECE,<br />Manakula Vinayagar Institute of Technology,<br />Puducherry - 605107</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-gold-divider" />
        <div className="footer-bottom">
          <div className="home-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <p className="footer-copyright">&copy; 2026 MITRONCE Symposium | All Rights Reserved</p>
            <div className="footer-credit">
              <span className="footer-credit-label">Crafted with <span className="footer-heart">♥</span> by</span>
              <a href="https://www.instagram.com/adarsh_haldkar_/" target="_blank" rel="noopener noreferrer" className="footer-credit-link">
                <i className="fab fa-instagram footer-credit-insta" />
                <span className="footer-credit-name">Adarsh Patel</span>
                <span className="footer-credit-arrow">→</span>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══ BACK TO TOP ═══ */}
      <button
        className={`back-to-top${showBackToTop ? ' visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <i className="fas fa-chevron-up" />
      </button>
    </div>
  );
};

export default Home;
