import smtplib
from email.message import EmailMessage
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, html_content: str):
    """
    Sends an email using standard Python smtplib.
    Uses settings for SMTP host, port, credentials.
    """
    if not settings.SMTP_HOST:
        logger.warning(f"SMTP_HOST not configured. Mock sending email to {to_email}")
        logger.debug(f"Subject: {subject}\nContent: {html_content}")
        return False

    msg = EmailMessage()
    msg['Subject'] = subject
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = to_email
    msg.set_content("Please enable HTML to view this email.")
    msg.add_alternative(html_content, subtype='html')

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        logger.info(f"Email successfully sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False

def get_password_reset_html(reset_link: str) -> str:
    return f"""
    <html>
      <body>
        <h2>Password Reset Request</h2>
        <p>You recently requested to reset your password for your CA ERP Platform account.</p>
        <p>Click the link below to reset it:</p>
        <p><a href="{reset_link}">{reset_link}</a></p>
        <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
        <p>Thanks,<br>The CA ERP Team</p>
      </body>
    </html>
    """

def get_email_verification_html(verify_link: str) -> str:
    return f"""
    <html>
      <body>
        <h2>Welcome to CA ERP Platform!</h2>
        <p>Please verify your email address to activate your account.</p>
        <p>Click the link below to verify:</p>
        <p><a href="{verify_link}">{verify_link}</a></p>
        <p>Thanks,<br>The CA ERP Team</p>
      </body>
    </html>
    """
