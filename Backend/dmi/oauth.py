"""Small OAuth 2.0/OIDC adapter for Google and GitHub identity sign-in."""
import json
from urllib import error, parse, request

from .config import get_settings


class OAuthProviderError(RuntimeError):
    pass


def configured(provider: str) -> bool:
    settings = get_settings()
    return bool((settings.google_client_id and settings.google_client_secret) if provider == "google" else (settings.github_client_id and settings.github_client_secret))


def authorization_url(provider: str, state: str, redirect_uri: str) -> str:
    settings = get_settings()
    if not configured(provider):
        raise OAuthProviderError(f"{provider.title()} sign-in is not configured")
    if provider == "google":
        base = "https://accounts.google.com/o/oauth2/v2/auth"
        params = {"client_id": settings.google_client_id, "redirect_uri": redirect_uri, "response_type": "code", "scope": "openid email profile", "state": state, "prompt": "select_account"}
    else:
        base = "https://github.com/login/oauth/authorize"
        params = {"client_id": settings.github_client_id, "redirect_uri": redirect_uri, "scope": "read:user user:email", "state": state}
    return f"{base}?{parse.urlencode(params)}"


def _post_form(url: str, values: dict[str, str], headers: dict[str, str] | None = None) -> dict:
    try:
        req = request.Request(url, data=parse.urlencode(values).encode(), headers={"Accept": "application/json", **(headers or {})})
        with request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode())
    except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise OAuthProviderError("OAuth provider is unavailable") from exc


def _get_json(url: str, token: str) -> object:
    try:
        req = request.Request(url, headers={"Authorization": f"Bearer {token}", "Accept": "application/json", "User-Agent": "DMI"})
        with request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode())
    except (error.URLError, TimeoutError, json.JSONDecodeError) as exc:
        raise OAuthProviderError("OAuth provider identity lookup failed") from exc


def exchange_code(provider: str, code: str, redirect_uri: str) -> tuple[str, str]:
    settings = get_settings()
    if provider == "google":
        token_data = _post_form("https://oauth2.googleapis.com/token", {"client_id": settings.google_client_id, "client_secret": settings.google_client_secret, "code": code, "grant_type": "authorization_code", "redirect_uri": redirect_uri})
        access_token = token_data.get("access_token")
        if not access_token:
            raise OAuthProviderError("Google did not return an access token")
        profile = _get_json("https://openidconnect.googleapis.com/v1/userinfo", access_token)
        if not profile.get("email") or not profile.get("email_verified") or not profile.get("sub"):
            raise OAuthProviderError("Google did not provide a verified email")
        return str(profile["sub"]), str(profile["email"]).lower()

    token_data = _post_form("https://github.com/login/oauth/access_token", {"client_id": settings.github_client_id, "client_secret": settings.github_client_secret, "code": code, "redirect_uri": redirect_uri})
    access_token = token_data.get("access_token")
    if not access_token:
        raise OAuthProviderError("GitHub did not return an access token")
    profile = _get_json("https://api.github.com/user", access_token)
    emails = _get_json("https://api.github.com/user/emails", access_token)
    verified = next((item for item in emails if item.get("verified") and item.get("primary") and item.get("email")), None)
    if not verified:
        verified = next((item for item in emails if item.get("verified") and item.get("email")), None)
    if not profile.get("id") or not verified:
        raise OAuthProviderError("GitHub did not provide a verified email")
    return str(profile["id"]), str(verified["email"]).lower()
