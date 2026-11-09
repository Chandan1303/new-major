import html
import os
import smtplib
import socket
import ssl
from email.message import EmailMessage
from email.utils import parseaddr

import requests


def _frontend_base_url():
    configured_urls = [
        value.strip().rstrip("/")
        for value in os.environ.get("FRONTEND_URL", "").split(",")
        if value.strip()
    ]
    for url in configured_urls:
        if "localhost" not in url and "127.0.0.1" not in url:
            return url

    try:
        for address in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ip_address = address[4][0]
            if not ip_address.startswith("127."):
                return f"http://{ip_address}:5173"
    except OSError:
        pass

    return configured_urls[0] if configured_urls else "http://localhost:5173"


def _send_auth_email(recipient, name, token, *, is_reset):
    provider = os.environ.get("EMAIL_PROVIDER", "smtp").strip().lower()
    host = os.environ.get("EMAIL_HOST")
    port = int(os.environ.get("EMAIL_PORT", "587"))
    username = os.environ.get("EMAIL_USER")
    password = os.environ.get("EMAIL_PASSWORD")
    sender = os.environ.get("EMAIL_FROM") or username

    if is_reset:
        subject = "Reset your SugarYield AI password"
        url = f"{_frontend_base_url()}/reset-password/{token}"
        heading = "Reset your password"
        action = "Reset Password"
        expires = "This link expires in 30 minutes."
    else:
        subject = "Verify your email - SugarYield AI"
        url = f"{_frontend_base_url()}/verify-email/{token}"
        heading = "Verify your email address"
        action = "Verify Email Address"
        expires = "This verification link expires in 24 hours."

    safe_name = html.escape(name or "there")
    safe_url = html.escape(url, quote=True)
    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(f"Hello {name or 'there'},\n\n{heading}: {url}\n\n{expires}")
    message.add_alternative(
        "<!doctype html><html><body style=\"font-family:Arial,sans-serif;color:#202820\">"
        f"<h1>{heading}</h1><p>Hello {safe_name},</p>"
        f"<p><a href=\"{safe_url}\">{action}</a></p>"
        f"<p>If the button does not work, open: <a href=\"{safe_url}\">{safe_url}</a></p>"
        f"<p>{expires}</p></body></html>",
        subtype="html",
    )

    if provider == "brevo":
        api_key = os.environ.get("BREVO_API_KEY")
        sender_name, sender_email = parseaddr(sender or "")
        if not api_key or not sender_email:
            raise RuntimeError("Brevo email delivery requires BREVO_API_KEY and EMAIL_FROM.")

        response = requests.post(
            "https://api.brevo.com/v3/smtp/email",
            headers={"api-key": api_key, "accept": "application/json"},
            json={
                "sender": {"name": sender_name or "SugarYield AI", "email": sender_email},
                "to": [{"email": recipient, "name": name or ""}],
                "subject": subject,
                "textContent": message.get_body(preferencelist=("plain",)).get_content(),
                "htmlContent": message.get_body(preferencelist=("html",)).get_content(),
            },
            timeout=20,
        )
        response.raise_for_status()
        return

    if provider != "smtp":
        raise RuntimeError(f"Unsupported EMAIL_PROVIDER: {provider}")
    if not host or not sender:
        raise RuntimeError("SMTP email delivery requires EMAIL_HOST and EMAIL_FROM.")

    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=ssl.create_default_context(), timeout=20) as smtp:
            if username:
                smtp.login(username, password or "")
            smtp.send_message(message)
        return

    with smtplib.SMTP(host, port, timeout=20) as smtp:
        smtp.ehlo()
        smtp.starttls(context=ssl.create_default_context())
        smtp.ehlo()
        if username:
            smtp.login(username, password or "")
        smtp.send_message(message)


def send_verification_email(name, recipient, token):
    _send_auth_email(recipient, name, token, is_reset=False)


def send_reset_email(name, recipient, token):
    _send_auth_email(recipient, name, token, is_reset=True)
