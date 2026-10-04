import { useCallback, useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import AuthPanel from "../components/workspace/AuthPanel.jsx";
import { api } from "../api.js";
import { useAuth } from "../context/auth.js";
import "../styles/workspace.css";

const countries = ["", "India", "USA", "Canada", "UK", "Australia"];

function JobCard({ job, token, saved, onSaved, hasSkills }) {
  const [match, setMatch] = useState(null);
  const [draft, setDraft] = useState("");
  const [draftSource, setDraftSource] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await api("/api/applications", { method: "POST", token, body: JSON.stringify({ job_id: job.id }) });
      await onSaved();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const checkFit = async () => {
    setBusy(true);
    setError("");
    try {
      setMatch(await api(`/api/jobs/${job.id}/match`, { token }));
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  const createDraft = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await api(`/api/jobs/${job.id}/draft-cover-letter`, { method: "POST", token });
      setDraft(result.draft);
      setDraftSource(result.source || "local draft");
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="job-card">
      <div className="job-index">{job.source === "demo" ? "ILLUSTRATIVE LISTING" : `${job.country} · JOB-BOARD SNAPSHOT`}</div>
      <div className="job-topline"><div><h3>{job.title}</h3><p>{job.company} <span className="job-divider">/</span> {job.location}</p></div><span className="job-country">{job.country}</span></div>
      <p className="job-description">{job.description ? `${job.description.slice(0, 260)}${job.description.length > 260 ? "…" : ""}` : "No description available from the source."}</p>
      <div className="job-actions">
        {job.source !== "demo" && <a className="text-link" href={job.job_url} target="_blank" rel="noopener noreferrer">View original listing <span>↗</span></a>}
        {token && <button className="quiet-button" onClick={save} disabled={busy || saved}>{saved ? "Saved ✓" : "Save to tracker +"}</button>}
        {token && <button className="quiet-button" onClick={checkFit} disabled={busy || !hasSkills}>Check skill overlap →</button>}
        {token && <button className="quiet-button" onClick={createDraft} disabled={busy}>Draft cover letter →</button>}
      </div>
      {token && !hasSkills && <p className="micro-note">Add your skills above to compare this role.</p>}
      {error && <p role="alert" className="form-error">{error}</p>}
      {match && <div className="match-readout" aria-live="polite">
        <strong>{match.score === null ? "Not enough detail to score" : `${match.score}% skill overlap`}</strong>
        <span>Shared: {match.matched.join(", ") || "None found"}</span>
        <span>To explore: {match.missing.join(", ") || "None found"}</span>
        <small>{match.method}</small>
      </div>}
      {draft && <div className="match-readout draft-readout" aria-live="polite"><strong>Draft for your review</strong><p>{draft}</p><small>{draftSource}; check every claim before using it. DMI does not submit applications.</small></div>}
    </article>
  );
}

export default function Jobs() {
  const { token, user, updateSkills, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [status, setStatus] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [filters, setFilters] = useState({ q: "", country: "" });
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");
  const [profileError, setProfileError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshSaved = useCallback(async () => {
    if (!token) { setSavedIds([]); return; }
    try {
      const items = await api("/api/applications", { token });
      setSavedIds(items.map((item) => item.job.id));
    } catch { setSavedIds([]); }
  }, [token]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filters.q) params.set("q", filters.q);
      if (filters.country) params.set("country", filters.country);
      const [records, metadata] = await Promise.all([api(`/api/jobs?${params}`), api("/api/data-status")]);
      setJobs(records);
      setStatus(metadata);
    } catch (failure) {
      setError(`Could not load the job snapshot. ${failure.message}`);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // Intentional load after entering or changing job search filters.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // Intentional saved-job lookup when the session changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshSaved();
  }, [refreshSaved]);

  const saveSkills = async (event) => {
    event.preventDefault();
    setProfileError("");
    setNotice("");
    try {
      await updateSkills(skills.split(",").map((item) => item.trim()).filter(Boolean));
      setNotice("Your skills were saved.");
    } catch (failure) {
      setProfileError(failure.message);
    }
  };

  return <>
    <Navbar />
    <main className="page-shell workspace-page">
      <div className="page-kicker"><span>05</span> JOB WORKSPACE <span className="kicker-rule" /> EXPLORE / SAVE / TRACK</div>
      <section className="workspace-intro">
        <div><p className="eyebrow">FROM SIGNAL TO ACTION</p><h1>Find your next move.</h1></div>
        <p>Browse a stored snapshot of developer roles. Match the skills you already have, save interesting positions, and decide what to apply for yourself.</p>
      </section>

      <div className="workspace-columns">
        <section className="workspace-main" aria-label="Job listings">
          <div className="workspace-section-heading"><div><span className="section-number">01</span><h2>The listings</h2></div><span className="muted">{status ? `${status.total} stored · ${status.demo_count} illustrative` : "Checking data…"}</span></div>
          <p className="source-note">{status?.updated_at ? `Latest import: ${new Date(status.updated_at).toLocaleString()}.` : "No jobs imported yet. The background worker will fetch a snapshot when available."} Listings may expire or be incomplete. Demo records are not real vacancies.</p>
          <form className="job-filters" onSubmit={(event) => { event.preventDefault(); setFilters({ q: search.trim(), country }); }}>
            <label>Role or skill<input type="search" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="e.g. Python, platform engineer" /></label>
            <label>Country<select value={country} onChange={(event) => setCountry(event.target.value)}>{countries.map((item) => <option key={item} value={item}>{item || "All places"}</option>)}</select></label>
            <button className="action-button" type="submit">Search ↗</button>
          </form>
          <div className="results-meta"><span>{loading ? "Loading…" : `${jobs.length} result${jobs.length === 1 ? "" : "s"}`}</span><button className="quiet-button" type="button" onClick={load} disabled={loading}>Refresh snapshot ↻</button></div>
          {error && <p role="alert" className="form-error">{error}</p>}
          {!loading && !error && jobs.length === 0 && <div className="workspace-empty"><h3>No listings in this view.</h3><p>Try a broader search. If the database is new, wait for the worker or use the clearly labeled demo dataset in the README.</p></div>}
          <div className="job-list">{jobs.map((job) => <JobCard key={job.id} job={job} token={token} saved={savedIds.includes(job.id)} onSaved={refreshSaved} hasSkills={Boolean(user?.skills?.length)} />)}</div>
        </section>
        <aside className="workspace-side" aria-label="Your search profile">
          {token ? <div className="workspace-panel">
            <p className="eyebrow">YOUR SEARCH PROFILE</p><h2>Make the signal personal.</h2>
            <p className="muted">{user?.email || "Loading profile…"}</p>
            <form onSubmit={saveSkills} className="workspace-form">
              <label>Your skills, separated by commas<textarea value={skills} onChange={(event) => setSkills(event.target.value)} placeholder={user?.skills?.join(", ") || "Python, React, Docker"} rows="4" /></label>
              <p className="micro-note">Saved: {user?.skills?.join(", ") || "None yet"}. We compare known skill names; we don’t upload your résumé.</p>
              {profileError && <p role="alert" className="form-error">{profileError}</p>}
              {notice && <p role="status">{notice}</p>}
              <button className="action-button" type="submit">Save skills ↗</button>
            </form>
            <button className="quiet-button logout-button" type="button" onClick={logout}>Sign out</button>
          </div> : <AuthPanel />}
          <div className="workspace-aside-note"><span className="eyebrow">METHOD / 01</span><p>Skill overlap is a transparent keyword comparison, not AI, a fit guarantee, or a hiring prediction. You choose every application.</p></div>
        </aside>
      </div>
    </main>
  </>;
}
