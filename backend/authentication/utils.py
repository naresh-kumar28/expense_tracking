import random
import string
from django.core.mail import send_mail
from django.conf import settings
from .models import OTP

def generate_otp_code(length=6):
    """Generate a numeric OTP code"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp_email(user, purpose):
    """
    Generate an OTP and send it via email.
    In the real world, this could also trigger an SMS provider if phone_number is present.
    """
    code = generate_otp_code()
    
    # Optional: Invalidate existing unexpired OTPs for this purpose
    OTP.objects.filter(user=user, purpose=purpose, is_used=False).update(is_used=True)
    
    otp_record = OTP.objects.create(
        user=user,
        code=code,
        purpose=purpose
    )
    
    # Send Email
    subject = ""
    message = ""
    
    if purpose == 'signup':
        subject = "Verify your email address"
        message = f"Hi {user.first_name or user.email},\n\nYour OTP for account verification is: {code}\n\nIt expires in 5 minutes."
    elif purpose == 'reset_password':
        subject = "Password Reset OTP"
        message = f"Hi {user.first_name or user.email},\n\nYour OTP for resetting your password is: {code}\n\nIt expires in 5 minutes."

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )
    
    return otp_record
