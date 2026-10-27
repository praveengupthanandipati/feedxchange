import { useState } from "react";
import type { SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRightIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon } from "../../../../shared/components/icon";
import logo from "../../../../shared/assets/img/logo.png";
import { useLoginMutation } from "../../../../core/store/authApi";
import { useAuth } from "../../../../core/auth/AuthContext";
import { clearSession, saveTokens, savePermissionKeys } from "../../../../core/auth/session";
import "./Login.scss";

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
  const [login, { isLoading }] = useLoginMutation();
  const { reload } = useAuth();

  const persistSession = (data: {
    token?: string;
    accessToken?: string;
    result?: { token?: string };
    user?: Record<string, unknown>;
    refreshToken?: string;
    accessTokenExpiresAt?: string;
    permissionKeys?: string[];
    roleKey?: string | null;
  }) => {
    clearSession(); // never carry a previous user's session or permissions over
    const token = data?.token || data?.accessToken || data?.result?.token || "";
    const user = data?.user || {};

    localStorage.setItem("authUser", JSON.stringify({ email, token }));
    // Refresh token + expiry: the app renews the access token silently before it expires (see api/tokenRefresh.ts).
    saveTokens({ token, refreshToken: data?.refreshToken, accessTokenExpiresAt: data?.accessTokenExpiresAt });

    try {
      // Only what the app reads back (core/auth/session.ts); the rest of the profile stays out of storage, where any script
      // on the page could read it. Copies an older version saved are removed.
      localStorage.setItem("userId", String(user?.id ?? ""));
      localStorage.setItem("firstName", String(user?.firstName ?? ""));
      localStorage.setItem("lastName", String(user?.lastName ?? ""));
      localStorage.setItem("email", String(user?.email ?? ""));
      localStorage.setItem("roleName", String(user?.roleName ?? ""));
      localStorage.setItem("businessUnitType", String(user?.businessUnitType ?? ""));
      ["businessProfileId", "phoneNumber", "roleId", "businessName", "lastLoginDate", "permissions", "user"].forEach((key) =>
        localStorage.removeItem(key),
      );
      // Undefined (older API without permission keys) leaves the UI ungated, exactly as before.
      savePermissionKeys(data?.permissionKeys, data?.roleKey);
    } catch (err) {
      console.warn("Could not persist user data:", err);
    }
  };

  const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const data = await login({
        username: email,
        password,
        authenticationType: 0,
        phoneNumber: "",
        email: "",
        phoneOTP: "",
      }).unwrap();

      persistSession(data);
      reload();
      navigate("/admin/dashboard");
    } catch (err) {
      const message =
        err && typeof err === "object" && "data" in err
          ? (err as { data?: { message?: string } }).data?.message
          : undefined;
      setError(message || "Invalid username or password.");
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

          {error && (
            <p className="login__error" role="alert">
              {error}
            </p>
          )}

          <label className="login__label" htmlFor="email">
            Email address
          </label>
          <div className="login__input">
            <MailIcon aria-hidden />
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
            <LockIcon aria-hidden />
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
              {showPassword ? <EyeOffIcon aria-hidden /> : <EyeIcon aria-hidden />}
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

          <button type="submit" className="login__submit" disabled={isLoading}>
            {isLoading ? "Signing In…" : (
              <>
                Sign In <ArrowRightIcon aria-hidden />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

