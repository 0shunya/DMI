"""Transactional email adapter for verification codes.

`EMAIL_PROVIDER=log` is useful for local development: the OTP is logged and no
email leaves the machine. `EMAIL_PROVIDER=resend` uses Resend's free tier.
"""
import json
import logging
from urllib import error, request

from .config import get_settings

logger = logging.getLogger(__name__)


def send_verification_code(recipient: str, code: str) -> None:
    settings = get_settings()
    if settings.email_provider.lower() == "log":
        logger.warning("DMI local verification code for %s: %s", recipient, code)
        return
    if settings.email_provider.lower() != "resend" or not settings.resend_api_key:
        raise RuntimeError("Email delivery is not configured. Set EMAIL_PROVIDER=resend and RESEND_API_KEY.")

    payload = json.dumps({
        "from": settings.email_from,
        "to": [recipient],
        "subject": "Your DMI verification code",
        "html": f"<p>Your DMI verification code is <strong>{code}</strong>.</p><p>It expires in 10 minutes. If you did not request this, ignore this email.</p>",
    }).encode("utf-8")
    req = request.Request(
        "https://api.resend.com/emails",
        data=payload,
        headers={"Authorization": f"Bearer {settings.resend_api_key}", "Content-Type": "application/json"},
    )
    try:
        with request.urlopen(req, timeout=10) as response:
            if response.status >= 300:
                raise RuntimeError("Email provider rejected the message.")
    except (error.URLError, TimeoutError) as exc:
        raise RuntimeError("Email provider is unavailable; try again later.") from exc
