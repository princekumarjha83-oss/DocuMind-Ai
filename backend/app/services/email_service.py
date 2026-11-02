import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional
from app.core.config import settings

logger = logging.getLogger("documind.email")

class EmailService:
    @staticmethod
    def send_email(to_email: str, subject: str, html_content: str, text_content: Optional[str] = None):
        """Send transactional email via configured provider or development console."""
        if settings.EMAIL_PROVIDER == "smtp" and settings.SMTP_HOST and settings.SMTP_USER:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
                msg["To"] = to_email

                if text_content:
                    msg.attach(MIMEText(text_content, "plain"))
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    if settings.SMTP_TLS:
                        server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
                logger.info(f"Email sent successfully to {to_email} via SMTP")
                return True
            except Exception as e:
                logger.error(f"Failed to send email via SMTP to {to_email}: {str(e)}")
                return False
        else:
            # Development fallback: log cleanly and safely to console (ASCII-safe for Windows CP1252)
            try:
                print("\n" + "=" * 70)
                print(f"[DEV EMAIL] Sending to: {to_email}")
                print(f"Subject: {subject}")
                print(f"Content:\n{text_content or html_content}")
                print("=" * 70 + "\n")
            except Exception as pe:
                logger.warning(f"Failed to print dev email to console: {pe}")
            logger.info(f"[DEV EMAIL] Sent {subject} to {to_email}")
            return True

    @classmethod
    def send_verification_email(cls, to_email: str, name: str, token: str):
        verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"
        subject = f"Verify your {settings.PROJECT_NAME} account"
        text_content = f"""Hello {name},

Thank you for signing up for DocuMind AI.

Please verify your email address by opening the following link in your browser:
{verification_url}

This link is valid for {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours.

If you did not create this account, no further action is required.
"""
        html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #0d111c; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <h2 style="color: #6366f1; margin-top: 0;">Welcome to DocuMind AI</h2>
    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">Hello {name},</p>
    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">Please confirm your email address to enable verified document indexing and multi-document synthesis.</p>
    <div style="margin: 28px 0;">
      <a href="{verification_url}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; display: inline-block;">Verify Email Address</a>
    </div>
    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This link will expire in {settings.VERIFICATION_TOKEN_EXPIRE_HOURS} hours. If the button above does not work, copy and paste this link:<br><a href="{verification_url}" style="color: #06b6d4;">{verification_url}</a></p>
  </div>
</body>
</html>"""
        return cls.send_email(to_email, subject, html_content, text_content)

    @classmethod
    def send_password_reset_email(cls, to_email: str, name: str, token: str):
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        subject = f"Reset your {settings.PROJECT_NAME} password"
        text_content = f"""Hello {name},

We received a request to reset your DocuMind AI password.

Open the following link to set a new password:
{reset_url}

This link will expire in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.

If you did not request a password reset, you can safely ignore this email.
"""
        html_content = f"""<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f1f5f9; padding: 40px 20px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #0d111c; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px;">
    <h2 style="color: #6366f1; margin-top: 0;">Password Reset Request</h2>
    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">Hello {name},</p>
    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">Click the button below to choose a new password for your DocuMind AI workspace.</p>
    <div style="margin: 28px 0;">
      <a href="{reset_url}" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600; display: inline-block;">Reset Password</a>
    </div>
    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">This link will expire in {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes.<br>Link URL: <a href="{reset_url}" style="color: #06b6d4;">{reset_url}</a></p>
  </div>
</body>
</html>"""
        return cls.send_email(to_email, subject, html_content, text_content)

email_service = EmailService()

