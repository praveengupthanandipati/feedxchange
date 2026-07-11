import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import logo from "../../assets/img/logo.png";
import "./Login.scss";

const TEST_EMAIL = "admin@feedxchange.in";
const TEST_PASSWORD = "Admin@123";

const FEATURES = [
  "Real-time order & stock tracking",
  "Granular user & role management",
  "Insights across every location",
];

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (email === TEST_EMAIL && password === TEST_PASSWORD) {
      setError("");
      navigate("/");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="login">
      <div className="login__panel">
        <img src={logo} alt="feedXchange" className="login__logo" />

        <div className="login__panel-copy">
          <h1>Manage your store, effortlessly.</h1>
          <p>
            Track orders, products, and customers from one clean, focused
            dashboard built for your team.
          </p>
        </div>

        <ul className="login__features">
          {FEATURES.map((feature) => (
            <li key={feature}>
              <span className="login__feature-dot" aria-hidden />
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="login__form-wrapper">
        <form className="login__card" onSubmit={handleSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="login__subtitle">Sign in to continue to your dashboard.</p>

          <p className="login__hint">
            Use <strong>{TEST_EMAIL}</strong> / <strong>{TEST_PASSWORD}</strong>
          </p>

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <label className="login__label" htmlFor="email">
            Email address
          </label>
          <div className="login__input">
            <FiMail aria-hidden />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <label className="login__label" htmlFor="password">
            Password
          </label>
          <div className="login__input">
            <FiLock aria-hidden />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              className="login__toggle-visibility"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff aria-hidden /> : <FiEye aria-hidden />}
            </button>
          </div>

          <label className="login__remember">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
            />
            Remember me
          </label>

          <button type="submit" className="login__submit">
            Sign In <FiArrowRight aria-hidden />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
