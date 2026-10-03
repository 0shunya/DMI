"""Optional local AI assistance. The feature stays disabled unless Ollama is configured."""
import json
from urllib import error, request

from .config import get_settings
from .models import Job, User


def draft_cover_letter(job: Job, user: User) -> str:
    settings = get_settings()
    if not settings.ollama_url:
        raise RuntimeError("Local AI is not configured. Set OLLAMA_URL to enable drafting.")

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
    return draft[:6000]
