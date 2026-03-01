from typing import Literal
from app.config import settings


def generate_email_template(
        raw_token: str,
        email_type: Literal["password_reset", "email_verification"],
        username: str = ""
) -> str:
    if email_type == "password_reset":
        endpoint = f"{settings.frontend_url}/reset-password"
        title = "Reset your password"
        description = "Click the button below to reset your password."
        button_text = "Reset password"
        footer_text = "If you didn't request a password reset, you can safely ignore this email."
    else:  # email_verification
        endpoint = f"{settings.frontend_url}/verify-email"
        title = "Verify your email address"
        description = f"Hi {username}, please click the button below to verify your email address." if username else "Please click the button below to verify your email address."
        button_text = "Verify email"
        footer_text = "If you didn't create an account, you can safely ignore this email."

    # Personalize greeting if username provided
    greeting = f"Hi {username}," if username and email_type == "email_verification" else ""

    html_body = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title} | ESBOX</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f5f5f5; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table width="100%" max-width="400" cellpadding="0" cellspacing="0" border="0" style="max-width: 400px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px 32px 32px 32px;">
                                {f'<p style="color: #4a4a4a; font-size: 14px; margin: 0 0 8px 0;">{greeting}</p>' if greeting else ''}
                                <h2 style="color: #1a1a1a; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">{title}</h2>
                                <p style="color: #4a4a4a; font-size: 14px; line-height: 20px; margin: 0 0 32px 0;">{description} This link will expire in 60 minutes.</p>

                                <!-- Button -->
                                <a href="{endpoint}?token={raw_token}" style="display: inline-block; background-color: #000000; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 500; padding: 12px 24px; border-radius: 6px;">{button_text}</a>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="padding: 24px 32px 32px 32px; border-top: 1px solid #eaeaea;">
                                <p style="color: #888888; font-size: 12px; line-height: 16px; margin: 0;">
                                    {footer_text}<br>
                                    © 2026 ESBOX
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

    return html_body
