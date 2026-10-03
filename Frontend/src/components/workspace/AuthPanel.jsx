import { useState } from "react";
import { useAuth } from "../../context/auth.js";

export default function AuthPanel() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email, password, mode);
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="workspace-panel auth-panel" aria-label="Your account">
      <p className="eyebrow">YOUR PRIVATE WORKSPACE</p>
      <h2>{mode === "register" ? "Make a space for your search." : "Pick up where you left off."}</h2>
      <p>Save roles, compare your skills, and track progress. Applications are never submitted for you.</p>
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
