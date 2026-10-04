import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/auth.js";

export default function OAuthCallback() {
  const { exchangeOAuthTicket } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [error, setError] = useState("");
  const ticket = params.get("ticket");

  useEffect(() => {
    if (!ticket) return;
    exchangeOAuthTicket(ticket).then(() => navigate("/jobs", { replace: true })).catch((failure) => setError(failure.message));
  }, [exchangeOAuthTicket, navigate, ticket]);

  const displayError = error || (!ticket ? "Missing OAuth sign-in ticket." : "");
  return <main className="page-shell tracker-auth"><section className="workspace-panel"><p className="eyebrow">SECURE SIGN-IN</p><h2>{displayError ? "Sign-in could not finish." : "Finishing sign-in…"}</h2>{displayError && <p role="alert" className="form-error">{displayError}</p>}</section></main>;
}
