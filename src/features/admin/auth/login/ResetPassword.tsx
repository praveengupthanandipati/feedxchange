import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SubmitEvent } from "react";
import { ArrowRightIcon, CircleCheckBigIcon, EyeIcon, EyeOffIcon, LockIcon, MailIcon, XIcon } from "../../../../shared/components/icon";
import { useForgotPasswordMutation, useResetPasswordMutation, useValidateOtpForResetPasswordMutation } from "../../../../core/store/authApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";

const OTP_LENGTH = 4;
/** Seconds before the code can be sent again. */
const RESEND_WAIT = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Same rules as the website signup. */
const PASSWORD_RULES: { label: string; test: (value: string) => boolean }[] = [
  { label: "8+ characters", test: (value) => value.length >= 8 },
  { label: "an uppercase letter", test: (value) => /[A-Z]/.test(value) },
  { label: "a lowercase letter", test: (value) => /[a-z]/.test(value) },
  { label: "a number", test: (value) => /\d/.test(value) },
  { label: "a special character", test: (value) => /[^A-Za-z0-9]/.test(value) },
];

type Step = "email" | "otp" | "password" | "done";
type Notice = { kind: "info" | "success" | "error"; text: string } | null;

interface ResetPasswordProps {
  /** Back to Sign In (the close button, "Sign in" link, or after a successful reset). */
  onBack: () => void;
}

/**
 * "Reset Your Password", inside the login card: email -> code from the email (ValidateOTPForResetPassword) -> new password.
 * Uses the login screen's own styles.
 */
const ResetPassword = ({ onBack }: ResetPasswordProps) => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState<{ userId: number; token: string | null }>({ userId: 0, token: null });
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [wait, setWait] = useState(0);
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const emailRef = useRef<HTMLInputElement>(null);

  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [validateOtp, { isLoading: verifying }] = useValidateOtpForResetPasswordMutation();
  const [resetPassword, { isLoading: saving }] = useResetPasswordMutation();

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
    if (step === "otp") boxes.current[0]?.focus();
  }, [step]);

  // Countdown before the code can be sent again.
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  /** Sends (or re-sends) the reset code. */
  const sendCode = async (resend: boolean) => {
    try {
      const reply = await forgotPassword({ email: email.trim() }).unwrap();
      setAccount({ userId: Number(reply?.userId) || 0, token: reply?.token ?? null });
      setDigits(Array(OTP_LENGTH).fill(""));
      setWait(RESEND_WAIT);
      setStep("otp");
      setNotice({
        kind: resend ? "success" : "info",
        text: resend
          ? "A new reset code has been sent to your email address."
          : "If this email belongs to an account, we've sent a reset code to it. Check your Inbox and Spam folder as well.",
      });
      boxes.current[0]?.focus();
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "We couldn't send the reset code. Please try again.") });
    }
  };

  const submitEmail = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;
    if (!email.trim()) return setNotice({ kind: "error", text: "Enter your registered email address." });
    if (!EMAIL_PATTERN.test(email.trim())) return setNotice({ kind: "error", text: "Enter a valid email address, e.g. name@company.com." });
    void sendCode(false);
  };

  // ---------- code boxes ----------
  const fill = (code: string, start = 0) => {
    const chars = code.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    setDigits((prev) => prev.map((digit, i) => (i >= start && i - start < chars.length ? chars[i - start] : digit)));
    boxes.current[Math.min(start + chars.length, OTP_LENGTH - 1)]?.focus();
  };
  const onDigit = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (value.length > 1) return fill(value, index);
    setDigits((prev) => prev.map((digit, i) => (i === index ? value : digit)));
    if (value && index < OTP_LENGTH - 1) boxes.current[index + 1]?.focus();
  };
  const onDigitKey = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigits((prev) => prev.map((digit, i) => (i === index - 1 ? "" : digit)));
      boxes.current[index - 1]?.focus();
    }
  };
  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fill(event.clipboardData.getData("text"));
  };

  const submitOtp = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (verifying) return;
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) return setNotice({ kind: "error", text: `Enter the ${OTP_LENGTH}-digit code from your email.` });
    try {
      const ok = await validateOtp({ registrationId: account.userId, otp }).unwrap();
      if (ok === false) {
        setNotice({ kind: "error", text: "Invalid code. Please check it and try again." });
        setDigits(Array(OTP_LENGTH).fill(""));
        boxes.current[0]?.focus();
        return;
      }
      setNotice({ kind: "success", text: "Code verified. Choose a new password." });
      setStep("password");
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "Invalid code. Please check it and try again.") });
    }
  };

  // ---------- new password ----------
  const submitPassword = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving) return;
    const missing = PASSWORD_RULES.filter((rule) => !rule.test(password));
    if (missing.length) return setNotice({ kind: "error", text: `Your password needs ${missing.map((rule) => rule.label).join(", ")}.` });
    if (password !== confirm) return setNotice({ kind: "error", text: "The passwords don't match." });
    if (!account.token) {
      // The code was right but the server sent no reset token, so the password can only be set from the emailed link.
      return setNotice({ kind: "error", text: "We couldn't set the password here. Please use the reset link in your email." });
    }
    try {
      await resetPassword({ token: account.token, newPassword: password }).unwrap();
      setNotice(null);
      setStep("done");
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "We couldn't reset your password. Please try again.") });
    }
  };

  const noticeElement = notice && (
    <p className={`login__notice login__notice--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
      {notice.text}
    </p>
  );

  return (
    <div className="login__card login__card--reset">
      <button type="button" className="login__close" onClick={onBack} aria-label="Back to sign in">
        <XIcon aria-hidden />
      </button>

      {step === "email" && (
        <form onSubmit={submitEmail} noValidate>
          <h2>Reset Your Password</h2>
          <p className="login__subtitle">Enter your registered email to receive a reset code.</p>
          {noticeElement}
          <label className="login__label" htmlFor="reset-email">
            Email address
          </label>
          <div className="login__input">
            <MailIcon aria-hidden />
            <input
              ref={emailRef}
              id="reset-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (notice?.kind === "error") setNotice(null);
              }}
              autoComplete="email"
              required
            />
          </div>
          <button type="submit" className="login__submit" disabled={sending}>
            {sending ? "Sending…" : (
              <>
                Reset Password <ArrowRightIcon aria-hidden />
              </>
            )}
          </button>
          <p className="login__switch">
            Do you remember your password?{" "}
            <button type="button" className="login__link" onClick={onBack}>
              Sign in
            </button>
          </p>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={submitOtp} noValidate>
          <h2>Enter Reset Code</h2>
          <p className="login__subtitle">
            We&rsquo;ve sent a {OTP_LENGTH}-digit code to <strong>{email.trim()}</strong>.
          </p>
          {noticeElement}
          <fieldset className="login__otp">
            <legend className="visually-hidden">Enter the {OTP_LENGTH}-digit code</legend>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  boxes.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={OTP_LENGTH}
                value={digit}
                onChange={(event) => onDigit(index, event.target.value)}
                onKeyDown={(event) => onDigitKey(index, event)}
                onPaste={onPaste}
                onFocus={(event) => event.target.select()}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-invalid={notice?.kind === "error"}
              />
            ))}
          </fieldset>
          <button type="submit" className="login__submit" disabled={verifying}>
            {verifying ? "Verifying…" : (
              <>
                Verify Code <ArrowRightIcon aria-hidden />
              </>
            )}
          </button>
          <p className="login__switch">
            Didn&rsquo;t receive the code?{" "}
            <button type="button" className="login__link" onClick={() => void sendCode(true)} disabled={sending || wait > 0}>
              {sending ? "Sending…" : wait > 0 ? `Resend in ${wait}s` : "Resend code"}
            </button>
          </p>
          <p className="login__switch">
            Wrong email?{" "}
            <button
              type="button"
              className="login__link"
              onClick={() => {
                setNotice(null);
                setStep("email");
              }}
            >
              Change email
            </button>
          </p>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={submitPassword} noValidate>
          <h2>Set a New Password</h2>
          <p className="login__subtitle">Use at least 8 characters with an uppercase and a lowercase letter, a number and a special character.</p>
          {noticeElement}
          <label className="login__label" htmlFor="reset-password">
            New password
          </label>
          <div className="login__input">
            <LockIcon aria-hidden />
            <input
              id="reset-password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter a new password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
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
          <label className="login__label" htmlFor="reset-confirm">
            Confirm password
          </label>
          <div className="login__input">
            <LockIcon aria-hidden />
            <input
              id="reset-confirm"
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter the new password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              required
            />
          </div>
          <button type="submit" className="login__submit" disabled={saving}>
            {saving ? "Saving…" : (
              <>
                Save Password <ArrowRightIcon aria-hidden />
              </>
            )}
          </button>
        </form>
      )}

      {step === "done" && (
        <div className="login__done" role="status">
          <CircleCheckBigIcon aria-hidden />
          <h2>Password updated</h2>
          <p className="login__subtitle">Your password has been reset. Sign in with your new password.</p>
          <button type="button" className="login__submit" onClick={onBack}>
            Sign In <ArrowRightIcon aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
