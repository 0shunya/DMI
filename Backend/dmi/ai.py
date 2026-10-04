"""Optional AI assistance with a useful offline fallback.

When Ollama is configured, DMI asks it for a draft. Otherwise it creates a
truthful structured starting point locally; neither path submits an application.
"""
import json
from urllib import error, request

from .config import get_settings
from .models import Job, User


def _offline_draft(job: Job, user: User) -> str:
    skills = ", ".join(user.skills[:8]) if user.skills else "[relevant skills]"
    return f"""Dear {job.company} hiring team,

I am writing to express my interest in the {job.title} position at {job.company}. The role's location is listed as {job.location}.

My current strengths include {skills}. I would welcome the opportunity to discuss how these skills could support your team and the work described in this listing. I am especially interested in learning more about the role's priorities and how I could contribute.

Please replace this paragraph with one specific project or achievement that demonstrates your fit: [specific project or achievement].

Thank you for your time and consideration. I would be glad to discuss the position further.

Sincerely,
[Your name]"""


def draft_cover_letter(job: Job, user: User) -> tuple[str, str]:
    settings = get_settings()
    if not settings.ollama_url:
        return _offline_draft(job, user), "offline structured draft"

    prompt = f"""Write a concise, honest cover-letter draft for a human to review.
Do not invent experience, employers, achievements, or contact details.
Use placeholders like [specific project] when evidence is missing.
Keep it under 220 words and return only the letter.

Candidate skills: {', '.join(user.skills) or 'No skills provided'}
Role: {job.title}
Company: {job.company}
Location: {job.location}
Job description: {job.description[:6000]}
"""
    payload = json.dumps({
        "model": settings.ollama_model,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2, "num_predict": 420},
    }).encode("utf-8")
    endpoint = settings.ollama_url.rstrip("/") + "/api/generate"
    try:
        with request.urlopen(request.Request(endpoint, data=payload, headers={"Content-Type": "application/json"}), timeout=45) as response:
            result = json.loads(response.read().decode("utf-8"))
    except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise RuntimeError("Local AI service is unavailable; try again later.") from exc
    draft = str(result.get("response", "")).strip()
    if not draft:
        raise RuntimeError("Local AI returned an empty draft.")
    return draft[:6000], "local Ollama draft"
