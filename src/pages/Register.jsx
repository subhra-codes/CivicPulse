import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Leaf,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import "./register-theme.css";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name.trim(),
        email: user.email,
        role: "citizen",
        createdAt: serverTimestamp(),
      });

      navigate("/citizen");
    } catch (err) {
      console.error("Registration error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("An account with this email already exists.");
      } else if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/weak-password") {
        setError("Please choose a stronger password.");
      } else {
        setError("Unable to create your account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-register">
      <div className="cp-register__nature" aria-hidden="true" />

      <header className="cp-register__header">
        <Link to="/" className="cp-brand" aria-label="CivicPulse home">
          <span className="cp-brand__mark">
            <Leaf size={21} strokeWidth={1.8} />
          </span>
          <span>
            <span className="cp-brand__name">CivicPulse</span>
            <span className="cp-brand__tagline">SEE. SENSE. ACT.</span>
          </span>
        </Link>

        <nav className="cp-register__nav" aria-label="Primary navigation">
          <Link to="/#how-it-works">How it works</Link>
          <Link to="/#impact">Community Impact</Link>
          <Link to="/#about">About</Link>
        </nav>

        <Link to="/" className="cp-back-home">
          <ArrowLeft size={17} />
          <span>Back to home</span>
        </Link>
      </header>

      <main className="cp-register__main">
        <section className="cp-register__story">
          <div className="cp-kicker">
            <span />
            <p>
              CLEANER COMMUNITIES
              <br />
              STRONGER TOMORROWS
            </p>
          </div>

          <h1>
            People
            <br />
            create change
            <br />
            <em>in their communities.</em>
          </h1>

          <p className="cp-story-copy">
            Join CivicPulse and be part of a growing community that reports
            local issues, supports real solutions, and builds cleaner, safer
            neighbourhoods.
          </p>

          <div className="cp-benefits">
            <div className="cp-benefit">
              <span className="cp-benefit__icon">
                <Leaf size={23} strokeWidth={1.7} />
              </span>
              <div>
                <h2>Report local issues</h2>
                <p>From potholes to waste, make your community&apos;s voice heard.</p>
              </div>
            </div>

            <div className="cp-benefit">
              <span className="cp-benefit__icon">
                <UsersRound size={23} strokeWidth={1.7} />
              </span>
              <div>
                <h2>See real impact</h2>
                <p>Track progress from report to resolution.</p>
              </div>
            </div>

            <div className="cp-benefit">
              <span className="cp-benefit__icon">
                <ShieldCheck size={23} strokeWidth={1.7} />
              </span>
              <div>
                <h2>Stronger together</h2>
                <p>Cleaner places. Healthier communities.</p>
              </div>
            </div>
          </div>

          <div className="cp-quote">
            <span className="cp-quote__line" />
            <blockquote>
              “A cleaner, safer tomorrow
              <br />
              starts with people like you.”
            </blockquote>
            <span className="cp-quote__credit">CIVICPULSE</span>
          </div>
        </section>

        <section className="cp-register__form-wrap">
          <div className="cp-register__form-card">
            <div className="cp-form-kicker">
              <span />
              JOIN CIVICPULSE
            </div>

            <h2>Create your account</h2>
            <p className="cp-form-intro">
              Join CivicPulse and be part of the change.
            </p>

            <form onSubmit={handleSubmit} className="cp-form">
              <label className="cp-field">
                <span>Full Name</span>
                <div className="cp-input-wrap">
                  <UserRound size={19} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>
              </label>

              <label className="cp-field">
                <span>Email Address</span>
                <div className="cp-input-wrap">
                  <Mail size={19} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="cp-field">
                <span>Password</span>
                <div className="cp-input-wrap">
                  <LockKeyhole size={19} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="cp-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
                <small>Minimum 6 characters</small>
              </label>

              {error && (
                <div className="cp-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="cp-submit"
                disabled={loading}
              >
                <span>{loading ? "Creating account..." : "Create Account"}</span>
                {!loading && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="cp-form-divider" />

            <p className="cp-signin">
              Already have an account?{" "}
              <Link to="/login">Sign in</Link>
            </p>
          </div>

          <div className="cp-form-note">
            <span />
            <p>
              REAL PEOPLE.
              <br />
              CLEANER PLACES.
              <br />
              BRIGHTER TOMORROWS.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Register;
