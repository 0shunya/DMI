import { useState } from "react";
import { useAuth } from "../../context/auth.js";
import { API_URL } from "../../config.js";

function passwordStrength(value) {
  const checks = [
    { label: "12+ characters", valid: value.length >= 12 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(value) },
    { label: "Lowercase letter", valid: /[a-z]/.test(value) },
    { label: "Number", valid: /\d/.test(value) },
    { label: "Special character", valid: /[^A-Za-z\d]/.test(value) },
  ];
  const score = checks.filter((check) => check.valid).length;
  const label = score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";
  const level = score <= 1 ? "weak" : score <= 3 ? "fair" : score === 4 ? "good" : "strong";
  return { checks, score, label, level };
}

export default function AuthPanel() {
  const { signIn, verifyEmail, resendVerification } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const strength = passwordStrength(password);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await signIn(email, password, mode);
      if (mode === "register" && result.verification_required) setMode("verify");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await verifyEmail(email, code);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError("");
    try {
      await resendVerification(email);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const startOAuth = (provider) => {
    window.location.assign(`${API_URL}/api/auth/${provider}/start`);
  };

  if (mode === "verify") return <section className="workspace-panel auth-panel" aria-label="Verify your email">
    <p className="eyebrow">ONE LAST STEP</p><h2>Check your inbox.</h2>
    <p>Enter the six-digit code sent to <strong>{email}</strong>. In local log mode, it appears in the API logs.</p>
    <form onSubmit={verify} className="workspace-form">
      <label>Verification code<input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} /></label>
      {error && <p role="alert" className="form-error">{error}</p>}
      <button className="action-button" type="submit" disabled={busy}>{busy ? "Checking…" : "Verify email"} <span aria-hidden="true">↗</span></button>
    </form>
    <button type="button" className="quiet-button" onClick={resend} disabled={busy}>Resend code</button>
    <button type="button" className="quiet-button" onClick={() => { setMode("login"); setError(""); }}>Back to sign in</button>
  </section>;

  return (
    <section className="workspace-panel auth-panel" aria-label="Your account">
      <p className="eyebrow">YOUR PRIVATE WORKSPACE</p>
      <h2>{mode === "register" ? "Make a space for your search." : "Pick up where you left off."}</h2>
      <p>Save roles, compare your skills, and track progress. Applications are never submitted for you.</p>
      <div className="social-auth"><button type="button" className="social-button" onClick={() => startOAuth("google")}>Continue with Google <span>↗</span></button><button type="button" className="social-button" onClick={() => startOAuth("github")}>Continue with GitHub <span>↗</span></button></div>
      <div className="auth-divider"><span>or use email</span></div>
      <form onSubmit={submit} className="workspace-form">
        <label>Email<input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password
          <span className="password-field">
            <input type={showPassword ? "text" : "password"} minLength={12} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>{showPassword ? "Hide" : "Show"}</button>
          </span>
        </label>
        {mode === "register" && <div className={`password-meter password-meter-${strength.level}`} aria-live="polite">
          <div className="password-meter-heading"><span>Password strength</span><strong>{password ? strength.label : "Start typing"}</strong></div>
          <div className="password-meter-bars" aria-label={`Password strength: ${password ? strength.label : "not set"}`}>
            {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < strength.score ? "filled" : ""} />)}
          </div>
          <ul>{strength.checks.map((check) => <li key={check.label} className={check.valid ? "met" : ""}>{check.valid ? "✓" : "○"} {check.label}</li>)}</ul>
        </div>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="action-button" type="submit" disabled={busy}>{busy ? "Working…" : mode === "register" ? "Create account" : "Sign in"} <span aria-hidden="true">↗</span></button>
      </form>
      <button type="button" className="quiet-button" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>
        {mode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </section>
  );
}
