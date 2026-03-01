from email.message import EmailMessage
import aiosmtplib
from app.config import settings
from app.logger import logger


class MailService:
    def __init__(self):
        self.smtp_host = "smtp.gmail.com"
        self.smtp_port = 587
        self.username = settings.mailer_user
        self.password = settings.mailer_passkey

    async def send_email(
        self,
        subject: str,
        recipients: list[str],
        body: str,
        sender: str | None = None,
    ):
        sender = sender or self.username

        message = EmailMessage()
        message["From"] = sender
        message["To"] = ", ".join(recipients)
        message["Subject"] = subject
        message.set_content(body)
        message.add_alternative(body, subtype="html")

        try:
            result = await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                start_tls=True,
            )
            return result
        except Exception as e:
            logger.error(f"Email sending failed: {e}")
            return None


mail_service = MailService()