import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent, type SubmitEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftIcon, ArrowRightIcon, XIcon } from "../../../../shared/components/icon";
import { useResendOtpMutation, useValidateOtpMutation } from "../../../../core/store/registrationDetailsApi";
import { apiErrorMessage } from "../../../../core/store/sellerInvoiceApi";

const OTP_LENGTH = 4;
/** Seconds before "Resend OTP" can be used again. */
const RESEND_WAIT = 30;

type Notice = { kind: "info" | "success" | "error"; text: string };

const INITIAL_NOTICE: Notice = {
  kind: "info",
  text: "Please verify your email with the OTP sent to your email address. Check your Inbox and Spam folder as well.",
};

interface OtpVerificationProps {
  registrationId: number;
  email: string;
  phone: string;
  /** The OTP was accepted. */
  onVerified: () => void;
  /** "Start Over": back to the form to correct the email. */
  onStartOver: () => void;
  /** The close (X) button or Esc: back to the form. */
  onClose: () => void;
}

/** Phone with a tick: the dialog's illustration, in theme colours. */
const PhoneTick = () => (
  <svg className="otp-dialog__art" viewBox="0 0 96 128" aria-hidden>
    <rect x="14" y="4" width="68" height="120" rx="12" className="otp-dialog__art-body" />
    <rect x="20" y="14" width="56" height="98" rx="6" className="otp-dialog__art-screen" />
    <rect x="38" y="4" width="20" height="6" rx="3" className="otp-dialog__art-notch" />
    <rect x="40" y="116" width="16" height="3" rx="1.5" className="otp-dialog__art-notch" />
    <circle cx="48" cy="58" r="17" className="otp-dialog__art-ring" />
    <circle cx="48" cy="58" r="12" className="otp-dialog__art-badge" />
    <path d="M42 58.5l4 4 8-8" className="otp-dialog__art-tick" />
  </svg>
);

/** "OTP Verification Required": the step after "Join with us". The user types the OTP from their email to finish signing up. */
const OtpVerification = ({ registrationId, email, phone, onVerified, onStartOver, onClose }: OtpVerificationProps) => {
  const [digits, setDigits] = useState<string[]>(() => Array(OTP_LENGTH).fill(""));
  const [notice, setNotice] = useState<Notice>(INITIAL_NOTICE);
  const [wait, setWait] = useState(RESEND_WAIT);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const [validateOtp, { isLoading: verifying }] = useValidateOtpMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();

  // Focus the first box; Esc closes; the page behind does not scroll.
  useEffect(() => {
    inputs.current[0]?.focus();
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  // Countdown before Resend OTP is available again.
  useEffect(() => {
    if (wait <= 0) return;
    const timer = window.setTimeout(() => setWait((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [wait]);

  const setDigit = (index: number, value: string) => {
    setDigits((prev) => prev.map((digit, i) => (i === index ? value : digit)));
    if (notice.kind === "error") setNotice(INITIAL_NOTICE);
  };

  const onChange = (index: number, raw: string) => {
    const value = raw.replace(/\D/g, "");
    if (value.length > 1) return fill(value, index);
    setDigit(index, value);
    if (value && index < OTP_LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  /** Pasted or auto-filled code: spread it across the boxes from `start`. */
  const fill = (code: string, start = 0) => {
    const chars = code.replace(/\D/g, "").slice(0, OTP_LENGTH - start).split("");
    setDigits((prev) => prev.map((digit, i) => (i >= start && i - start < chars.length ? chars[i - start] : digit)));
    inputs.current[Math.min(start + chars.length, OTP_LENGTH - 1)]?.focus();
    if (notice.kind === "error") setNotice(INITIAL_NOTICE);
  };

  const onKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      event.preventDefault();
      setDigit(index - 1, "");
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fill(event.clipboardData.getData("text"));
  };

  const verify = async (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (verifying) return;
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      setNotice({ kind: "error", text: `Enter the ${OTP_LENGTH}-digit OTP.` });
      inputs.current[digits.findIndex((digit) => !digit)]?.focus();
      return;
    }
    try {
      const ok = await validateOtp({ registrationId, otp }).unwrap();
      if (ok === false) {
        setNotice({ kind: "error", text: "Invalid OTP. Please check the code and try again." });
        setDigits(Array(OTP_LENGTH).fill(""));
        inputs.current[0]?.focus();
        return;
      }
      onVerified();
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "We couldn't verify the OTP. Please try again.") });
    }
  };

  const resend = async () => {
    if (resending || wait > 0) return;
    try {
      const ok = await resendOtp({ registrationId }).unwrap();
      if (ok === false) {
        setNotice({ kind: "error", text: "We couldn't resend the OTP. Please try again." });
        return;
      }
      setNotice({ kind: "success", text: "OTP resent to your email address." });
      setDigits(Array(OTP_LENGTH).fill(""));
      setWait(RESEND_WAIT);
      inputs.current[0]?.focus();
    } catch (error) {
      setNotice({ kind: "error", text: apiErrorMessage(error, "We couldn't resend the OTP. Please try again.") });
    }
  };

  return createPortal(
    <div className="otp-dialog">
      <div className="otp-dialog__backdrop" aria-hidden />
      <div className="otp-dialog__panel" role="dialog" aria-modal="true" aria-labelledby="otp-title" aria-describedby="otp-text">
        <button type="button" className="otp-dialog__close" onClick={onClose} aria-label="Close">
          <XIcon aria-hidden />
        </button>

        <PhoneTick />
        <h2 id="otp-title">OTP Verification Required</h2>
        <p id="otp-text" className="otp-dialog__text">
          We&rsquo;ve sent a verification code to your registered email / phone number.
        </p>

        <dl className="otp-dialog__contact">
          <div>
            <dt>Email</dt>
            <dd>{email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>{phone}</dd>
          </div>
        </dl>

        <p className={`otp-dialog__notice otp-dialog__notice--${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>
          {notice.text}
        </p>

        <form className="otp-dialog__form" onSubmit={verify} noValidate>
          <fieldset className="otp-dialog__boxes">
            <legend className="visually-hidden-site">Enter the {OTP_LENGTH}-digit OTP</legend>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={OTP_LENGTH}
                value={digit}
                onChange={(event) => onChange(index, event.target.value)}
                onKeyDown={(event) => onKeyDown(index, event)}
                onPaste={onPaste}
                onFocus={(event) => event.target.select()}
                aria-label={`Digit ${index + 1} of ${OTP_LENGTH}`}
                aria-invalid={notice.kind === "error"}
                className={notice.kind === "error" ? "has-error" : undefined}
              />
            ))}
          </fieldset>

          <button type="submit" className="btn-site btn-site--primary btn-site--block" disabled={verifying}>
            {verifying ? (
              "Verifying…"
            ) : (
              <>
                Verify OTP &amp; Complete Registration <ArrowRightIcon aria-hidden />
              </>
            )}
          </button>
        </form>

        <p className="otp-dialog__resend">
          Didn&rsquo;t receive the OTP?{" "}
          <button type="button" onClick={resend} disabled={resending || wait > 0}>
            {resending ? "Sending…" : wait > 0 ? `Resend OTP in ${wait}s` : "Resend OTP"}
          </button>
        </p>

        <div className="otp-dialog__restart">
          <span>Wrong email address?</span>
          <button type="button" className="btn-site btn-site--outline" onClick={onStartOver}>
            <ArrowLeftIcon aria-hidden /> Start Over
          </button>
        </div>
      </div>
    </div>,
    // Inside the website root: every website style is scoped to .fx-site.
    document.querySelector(".fx-site") ?? document.body,
  );
};

export default OtpVerification;
