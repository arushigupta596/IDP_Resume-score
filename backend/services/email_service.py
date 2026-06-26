import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import SMTP_EMAIL, SMTP_PASSWORD


def send_outreach_email(candidate_name: str, candidate_email: str) -> dict:
    if not SMTP_EMAIL or not SMTP_PASSWORD:
        return {"success": False, "error": "SMTP credentials not configured"}

    subject = "Interview Invitation - Market Research Analyst at DP World"

    html_body = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #00234B; padding: 24px 32px;">
            <h2 style="color: #ffffff; margin: 0; font-size: 20px;">DP World</h2>
        </div>
        <div style="padding: 32px; background: #ffffff; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; margin-top: 0;">Dear {candidate_name},</p>

            <p style="font-size: 15px; line-height: 1.6;">
                Thank you for your interest in DP World. After reviewing your profile, we are pleased to
                inform you that you have been <strong>shortlisted</strong> for the
                <strong>Market Research Analyst</strong> position.
            </p>

            <p style="font-size: 15px; line-height: 1.6;">
                We would like to invite you for an interview to discuss your experience and how it aligns
                with our team's goals in maritime logistics and market intelligence.
            </p>

            <p style="font-size: 15px; line-height: 1.6;">
                Please reply to this email with your availability over the next two weeks, and we will
                schedule a convenient time for the conversation.
            </p>

            <p style="font-size: 15px; line-height: 1.6; margin-bottom: 0;">
                We look forward to speaking with you.
            </p>

            <p style="font-size: 15px; line-height: 1.6;">
                Best regards,<br/>
                <strong>HR Team</strong><br/>
                DP World<br/>
                <a href="mailto:{SMTP_EMAIL}" style="color: #00234B;">{SMTP_EMAIL}</a>
            </p>
        </div>
        <div style="padding: 16px 32px; background: #f9fafb; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
            <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This is an automated message from DP World Talent Intelligence.
            </p>
        </div>
    </div>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = SMTP_EMAIL
    msg["To"] = candidate_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}
