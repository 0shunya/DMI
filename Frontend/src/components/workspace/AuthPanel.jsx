import { useState } from "react";
import { useAuth } from "../../context/auth.js";

export default function AuthPanel() {
  const { signIn, verifyEmail, resendVerification } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    window.location.assign(`/api/auth/${provider}/start`);
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
        <label>Password<input type="password" minLength={12} maxLength={128} autoComplete={mode === "register" ? "new-password" : "current-password"} required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p role="alert" className="form-error">{error}</p>}
        <button className="action-button" type="submit" disabled={busy}>{busy ? "Working…" : mode === "register" ? "Create account" : "Sign in"} <span aria-hidden="true">↗</span></button>
      </form>
      <button type="button" className="quiet-button" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>
        {mode === "register" ? "Already have an account? Sign in" : "New here? Create an account"}
      </button>
    </section>
  );
}
