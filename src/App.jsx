import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CitizenDashboard from "./pages/CitizenDashboard";
import ReportIssue from "./pages/ReportIssue";
import AdminDashboard from "./pages/AdminDashboard";
import AdminReportDetails from "./pages/AdminReportDetails";
import TeamDashboard from "./pages/TeamDashboard";
import TeamReportDetails from "./pages/TeamReportDetails";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Leaf,
  MapPin,
  Menu,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);

  const benefits = [
    {
      icon: Brain,
      title: "AI-powered insights",
      description: "Turn citizen reports into clear, actionable information.",
    },
    {
      icon: Users,
      title: "Community-driven",
      description: "Let people confirm what matters in their neighbourhood.",
    },
    {
      icon: Leaf,
      title: "Smarter prioritization",
      description: "Identify high-impact issues and local hotspots faster.",
    },
    {
      icon: CheckCircle2,
      title: "Transparent progress",
      description: "Track an issue from first report through resolution.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Report",
      description: "Share the problem, describe what you see, and capture its location.",
    },
    {
      number: "02",
      title: "Sense",
      description: "AI evaluates severity, environmental risk, health risk, and community impact.",
    },
    {
      number: "03",
      title: "Prioritize",
      description: "Impact scores, confirmations, and location signals reveal what needs attention first.",
    },
    {
      number: "04",
      title: "Act",
      description: "Authorities assign response teams, track work, and verify the resolution.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f7f5ef] text-[#17201c] selection:bg-[#dcebe2] selection:text-[#064e3b]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#17201c]/10 bg-[#f7f5ef]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#064e3b] text-[#f7f5ef]">
              <Leaf size={22} strokeWidth={1.8} />
            </div>
            <div>
              <div className="font-serif text-[25px] leading-none tracking-[-0.03em]">CivicPulse</div>
              <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.28em] text-[#68716c]">
                See. Sense. Act.
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            <a href="#how-it-works" className="text-sm text-[#4f5a54] transition hover:text-[#064e3b]">
              How it works
            </a>
            <a href="#community-impact" className="text-sm text-[#4f5a54] transition hover:text-[#064e3b]">
              Community Impact
            </a>
            <a href="#about" className="text-sm text-[#4f5a54] transition hover:text-[#064e3b]">
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              to="/login"
              className="rounded-lg border border-[#9aa39e] px-5 py-2.5 text-sm font-medium text-[#17201c] transition hover:border-[#064e3b] hover:bg-white/60"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#064e3b] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#053d2f]"
            >
              Get Started
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg border border-[#17201c]/15 p-2 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#17201c]/10 bg-[#f7f5ef] px-6 py-5 md:hidden">
            <nav className="flex flex-col gap-5">
              <a href="#how-it-works" onClick={closeMenu} className="text-[#4f5a54]">How it works</a>
              <a href="#community-impact" onClick={closeMenu} className="text-[#4f5a54]">Community Impact</a>
              <a href="#about" onClick={closeMenu} className="text-[#4f5a54]">About</a>
              <Link to="/login" onClick={closeMenu} className="rounded-lg border border-[#9aa39e] px-5 py-3 text-center text-sm font-medium">Sign In</Link>
              <Link to="/register" onClick={closeMenu} className="rounded-lg bg-[#064e3b] px-5 py-3 text-center text-sm font-semibold text-white">Get Started</Link>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="mx-auto max-w-7xl px-6 pb-14 pt-12 sm:pt-16 lg:px-8 lg:pb-20 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div>
              <div className="mb-7 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7771]">
                <span className="h-px w-9 bg-[#7d8881]" />
                Cleaner cities · stronger communities
              </div>

              <h1 className="max-w-xl font-serif text-[3.65rem] leading-[0.98] tracking-[-0.045em] sm:text-[4.6rem] lg:text-[5.25rem]">
                A cleaner,
                <br />
                safer, fairer
                <br />
                <span className="text-[#0a5b45]">tomorrow.</span>
              </h1>

              <p className="mt-7 max-w-lg font-serif text-[1.18rem] leading-8 text-[#5b6660] sm:text-[1.25rem]">
                CivicPulse helps communities report civic and environmental problems, understand their impact, and coordinate faster, fairer responses.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/report"
                  className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#064e3b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#053d2f]"
                >
                  Report an Issue
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="#community-impact"
                  className="inline-flex items-center justify-center rounded-lg border border-[#9aa39e] bg-transparent px-6 py-3.5 text-sm font-medium text-[#17201c] transition hover:border-[#064e3b] hover:bg-white/50"
                >
                  See Community Impact
                </a>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-xs font-medium uppercase tracking-[0.13em] text-[#6b756f]">
                <span>AI-assisted analysis</span>
                <span className="hidden h-4 w-px bg-[#b9c0bb] sm:block" />
                <span>Location intelligence</span>
                <span className="hidden h-4 w-px bg-[#b9c0bb] sm:block" />
                <span>Community action</span>
              </div>
            </div>

            <div className="relative lg:pt-2">
              <div className="absolute -bottom-7 -right-5 hidden h-40 w-40 rounded-full bg-[#e2eee7] lg:block" />
              <div className="relative overflow-hidden rounded-t-[7rem] rounded-b-[1.5rem] shadow-[0_24px_60px_rgba(23,32,28,0.12)]">
                <img
                  src="/civicpulse-hero.png"
                  alt="Community members observing an urban neighbourhood"
                  className="h-[430px] w-full object-cover sm:h-[500px] lg:h-[555px]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17201c]/25 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-5 left-5 max-w-[220px] rounded-xl border border-white/70 bg-[#f7f5ef]/95 px-5 py-4 shadow-lg backdrop-blur-sm sm:left-8">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6b756f]">
                  <MapPin size={14} className="text-[#0a5b45]" />
                  Community intelligence
                </div>
                <p className="mt-2 font-serif text-lg leading-6">See what needs attention where it matters.</p>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFITS */}
        <section id="community-impact" className="border-y border-[#17201c]/10 bg-[#f2f1eb]">
          <div className="mx-auto grid max-w-7xl md:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className={`px-7 py-9 lg:px-8 ${index < benefits.length - 1 ? "lg:border-r lg:border-[#17201c]/10" : ""} ${index < 2 ? "border-b border-[#17201c]/10 md:border-b-0" : ""}`}>
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#e0ece5] text-[#064e3b]">
                  <Icon size={21} strokeWidth={1.7} />
                </div>
                <h3 className="font-serif text-xl">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#69736d]">{description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20 lg:px-8 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
            <div>
              <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6d7771]">
                <span className="h-px w-9 bg-[#7d8881]" />
                How CivicPulse works
              </div>
              <h2 className="mt-6 max-w-md font-serif text-4xl leading-[1.05] tracking-[-0.03em] sm:text-5xl">
                From a single report to community-level action.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-[#68726c]">
                One connected workflow brings citizens, AI analysis, location signals, authorities, and response teams together.
              </p>
            </div>

            <div className="border-t border-[#17201c]/15">
              {steps.map((step) => (
                <div key={step.number} className="grid grid-cols-[52px_1fr] gap-5 border-b border-[#17201c]/15 py-7 sm:grid-cols-[70px_150px_1fr] sm:items-start sm:gap-7">
                  <span className="font-serif text-2xl text-[#0a5b45]">{step.number}</span>
                  <h3 className="font-serif text-2xl">{step.title}</h3>
                  <p className="col-span-2 text-sm leading-6 text-[#69736d] sm:col-span-1">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT / CLOSING */}
        <section id="about" className="overflow-hidden border-t border-[#17201c]/10 bg-[#e8f0eb]">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-[1fr_0.9fr] lg:px-8 lg:py-20">
            <div className="relative min-h-[190px] overflow-hidden">
              <div className="absolute bottom-0 left-0 right-0 h-px bg-[#587067]/30" />
              <div className="absolute bottom-0 left-0 h-[155px] w-[92%] opacity-50">
                <div className="absolute bottom-0 left-[4%] h-[100px] w-[9%] border border-[#587067]/50" />
                <div className="absolute bottom-0 left-[15%] h-[135px] w-[13%] border border-[#587067]/50" />
                <div className="absolute bottom-0 left-[31%] h-[82px] w-[11%] border border-[#587067]/50" />
                <div className="absolute bottom-0 left-[44%] h-[150px] w-[15%] border border-[#587067]/50" />
                <div className="absolute bottom-0 left-[63%] h-[95px] w-[12%] border border-[#587067]/50" />
                <div className="absolute bottom-0 left-[79%] h-[125px] w-[13%] border border-[#587067]/50" />
              </div>
              <div className="absolute bottom-0 left-[7%] h-8 w-8 rounded-full border border-[#587067]/40" />
              <div className="absolute bottom-0 left-[22%] h-12 w-12 rounded-full border border-[#587067]/40" />
              <div className="absolute bottom-0 left-[71%] h-10 w-10 rounded-full border border-[#587067]/40" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#5d6d65]">A clearer civic signal</p>
              <blockquote className="mt-4 font-serif text-3xl leading-[1.15] tracking-[-0.025em] sm:text-4xl">
                “Stronger communities start with a louder, clearer voice.”
              </blockquote>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#6d7771]">— CivicPulse</p>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <div className="flex flex-col items-start justify-between gap-8 border-t border-[#17201c]/15 pt-10 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6d7771]">Make the signal count</p>
              <h2 className="mt-3 max-w-2xl font-serif text-4xl leading-tight tracking-[-0.03em] sm:text-5xl">
                See it. Sense it. Act on it.
              </h2>
            </div>
            <Link to="/register" className="group inline-flex shrink-0 items-center gap-3 rounded-lg bg-[#064e3b] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#053d2f]">
              Get Started
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#17201c]/10 bg-[#f2f1eb]">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-7 text-xs text-[#707a74] sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 CivicPulse</span>
          <span className="font-semibold uppercase tracking-[0.2em]">See. Sense. Act.</span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/citizen" element={<CitizenDashboard />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/report/:reportId" element={<AdminReportDetails />} />
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="/team/report/:reportId" element={<TeamReportDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
