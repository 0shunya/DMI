import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import AuthPanel from "../components/workspace/AuthPanel.jsx";
import { api } from "../api.js";
import { useAuth } from "../context/auth.js";
import "../styles/workspace.css";

const stages = ["saved", "applied", "interview", "offer", "rejected"];

function ApplicationRow({ item, token, onChange }) {
  const [notes, setNotes] = useState(item.notes);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const update = async (changes) => {
    setBusy(true);
    setError("");
    try {
      await api(`/api/applications/${item.id}`, { method: "PATCH", token, body: JSON.stringify(changes) });
      await onChange();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!window.confirm(`Remove ${item.job.title} from your tracker?`)) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/applications/${item.id}`, { method: "DELETE", token });
      await onChange();
    } catch (failure) {
      setError(failure.message);
      setBusy(false);
    }
  };
  return <article className="application-row">
    <div className="application-header">
      <div><span className="job-index">{item.job.source === "demo" ? "ILLUSTRATIVE LISTING" : item.job.country}</span><h3>{item.job.title}</h3><p>{item.job.company} · {item.job.location}</p></div>
      <label className="status-field">STATUS<select disabled={busy} value={item.status} onChange={(event) => update({ status: event.target.value })}>{stages.map((stage) => <option key={stage} value={stage}>{stage[0].toUpperCase() + stage.slice(1)}</option>)}</select></label>
    </div>
    <label className="notes-field">YOUR NOTES<textarea rows="2" maxLength="2000" value={notes} placeholder="Next step, follow-up date, interview notes…" onChange={(event) => setNotes(event.target.value)} /></label>
    <div className="job-actions">
      <button type="button" className="quiet-button" disabled={busy || notes === item.notes} onClick={() => update({ notes })}>Save note</button>
      {item.job.source !== "demo" && <a className="text-link" href={item.job.job_url} target="_blank" rel="noopener noreferrer">Original listing <span>↗</span></a>}
      <button type="button" className="quiet-button remove-button" disabled={busy} onClick={remove}>Remove</button>
    </div>
    {error && <p role="alert" className="form-error">{error}</p>}
  </article>;
}

export default function Applications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const rows = await api("/api/applications", { token });
      setItems(rows);
      setError("");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Intentional load when the account session changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
  }, [refresh]);

  return <>
    <Navbar />
    <main className="page-shell workspace-page">
      <div className="page-kicker"><span>06</span> APPLICATION TRACKER <span className="kicker-rule" /> YOUR PRIVATE RECORD</div>
      <section className="workspace-intro"><div><p className="eyebrow">A CLEARER PROCESS</p><h1>Make the next move count.</h1></div><p>Keep track of the roles you’ve saved and the applications you’ve submitted yourself. Change a status only when it actually happens.</p></section>
      {!token ? <div className="tracker-auth"><AuthPanel /></div> : <>
        <div className="workspace-section-heading"><div><span className="section-number">01</span><h2>Your pipeline</h2></div><span className="muted">{items.length} role{items.length === 1 ? "" : "s"}</span></div>
        <p className="source-note">DMI never submits an application or contacts an employer on your behalf. Demo listings are for exploring the workflow only.</p>
        {error && <p role="alert" className="form-error">{error}</p>}
        {loading && <p className="muted">Loading your records…</p>}
        {!loading && items.length === 0 && <div className="workspace-empty"><h3>Your pipeline starts with one role.</h3><p>Browse the job snapshot, save a position, and it will appear here.</p><a className="text-link" href="/jobs">Explore jobs <span>↗</span></a></div>}
        <div className="application-list">{items.map((item) => <ApplicationRow key={item.id} item={item} token={token} onChange={refresh} />)}</div>
      </>}
    </main>
  </>;
}
