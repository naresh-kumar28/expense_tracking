from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from .models import OTP
from .serializers import (
    SignupSerializer, VerifyOTPSerializer, ResendOTPSerializer,
    LoginSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
    ChangePasswordSerializer, UserSerializer, GoogleAuthSerializer
)
from .utils import send_otp_email

User = get_user_model()

def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    Handle User Signup.
    Creates an inactive user and sends an OTP to their email.
    """
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        send_otp_email(user, purpose='signup')
        return Response({
            "success": True,
            "message": "Account created successfully. Please check your email for the OTP.",
            "data": {"email": user.email}
        }, status=status.HTTP_201_CREATED)
    return Response({"success": False, "message": "Signup failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_otp(request):
    """
    Verify OTP sent to user email.
    If valid, marks the user as verified.
    """
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_verified:
            return Response({"success": False, "message": "Account already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
        otp = OTP.objects.filter(user=user, code=code, purpose='signup', is_used=False).last()
        
        if not otp:
            return Response({"success": False, "message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
        if otp.is_expired:
            return Response({"success": False, "message": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.is_verified = True
        user.is_active = True
        user.save()
        
        otp.is_used = True
        otp.save()
        
        return Response({"success": True, "message": "Account verified successfully. You can now login."}, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def resend_otp(request):
    """
    Resend OTP to the user.
    """
    serializer = ResendOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        if user.is_verified:
            return Response({"success": False, "message": "Account already verified."}, status=status.HTTP_400_BAD_REQUEST)
            
        send_otp_email(user, purpose='signup')
        return Response({"success": True, "message": "A new OTP has been sent to your email."}, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Authenticate user using email & password.
    Returns JWT tokens if credentials are valid and user is verified.
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.check_password(password):
             return Response({"success": False, "message": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
            
        if not user.is_verified:
            return Response({"success": False, "message": "Please verify your account first."}, status=status.HTTP_403_FORBIDDEN)
            
        tokens = get_tokens_for_user(user)
        user_data = UserSerializer(user).data
        return Response({
            "success": True, "message": "Login successful.", "data": {"tokens": tokens, "user": user_data}
        }, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send OTP for password reset"""
    serializer = ForgotPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
            if not user.is_verified:
                 return Response({"success": False, "message": "Account is not verified."}, status=status.HTTP_400_BAD_REQUEST)
                 
            send_otp_email(user, purpose='reset_password')
        except User.DoesNotExist:
            # We still return success to prevent email enumeration attacks
            pass
            
        return Response({"success": True, "message": "If the email is registered, an OTP will be sent."}, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password_verify_otp(request):
    """Verify OTP for resetting password"""
    serializer = VerifyOTPSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(user=user, code=code, purpose='reset_password', is_used=False).last()
            if not otp:
                return Response({"success": False, "message": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)
            if otp.is_expired:
                return Response({"success": False, "message": "OTP has expired."}, status=status.HTTP_400_BAD_REQUEST)
            
            # OTP is valid, frontend should redirect to reset-password step
            return Response({"success": True, "message": "OTP verified successfully."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"success": False, "message": "Invalid user."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Set new password using OTP"""
    serializer = ResetPasswordSerializer(data=request.data)
    if serializer.is_valid():
        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        password = serializer.validated_data['password']
        
        try:
            user = User.objects.get(email=email)
            otp = OTP.objects.filter(user=user, code=code, purpose='reset_password', is_used=False).last()
            
            if not otp or otp.is_expired:
                return Response({"success": False, "message": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
                
            user.set_password(password)
            user.save()
            
            otp.is_used = True
            otp.save()
            
            return Response({"success": True, "message": "Password reset successfully. You can now login."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"success": False, "message": "User not found."}, status=status.HTTP_404_NOT_FOUND)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change password for an authenticated user"""
    serializer = ChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        user = request.user
        old_password = serializer.validated_data['old_password']
        new_password = serializer.validated_data['new_password']
        
        if not user.check_password(old_password):
            return Response({"success": False, "message": "Incorrect old password."}, status=status.HTTP_400_BAD_REQUEST)
            
        user.set_password(new_password)
        user.save()
        return Response({"success": True, "message": "Password changed successfully."}, status=status.HTTP_200_OK)
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout by blacklisting the refresh token"""
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"success": False, "message": "Refresh token is required."}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({"success": True, "message": "Logged out successfully."}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({"success": False, "message": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_view(request):
    """Get current user details"""
    serializer = UserSerializer(request.user)
    return Response({
        "success": True,
        "message": "User details fetched successfully.",
        "data": serializer.data
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([AllowAny])
def google_auth(request):
    """
    Handle Google Auth (Log in or Sign up).
    Expects Google ID token from the frontend.
    """
    serializer = GoogleAuthSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.validated_data['token']
        try:
            # Specify the CLIENT_ID of the app that accesses the backend:
            google_client_id = settings.GOOGLE_CLIENT_ID
            idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), google_client_id)

            # Get user info from token
            email = idinfo.get('email')
            name = idinfo.get('name', '')
            google_sub = idinfo.get('sub')
            profile_image = idinfo.get('picture')
            
            if not email:
                return Response({"success": False, "message": "Email not found in Google Token."}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user already exists
            user = User.objects.filter(email=email).first()
            if user:
                # If the user exists but wasn't created via Google, we can link the accounts or reject.
                # Here we link the accounts safely and update the profile properties.
                if not user.google_sub:
                    user.google_sub = google_sub
                    user.auth_provider = 'google'
                # Ensure they are marked verified
                if not user.is_verified:
                    user.is_verified = True
                if profile_image and not user.profile_image:
                     user.profile_image = profile_image
                user.save()
            else:
                # Create a new user account
                name_parts = name.split(' ', 1)
                first_name = name_parts[0]
                last_name = name_parts[1] if len(name_parts) > 1 else ''
                
                user = User.objects.create(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_verified=True, # Verified automatically via Google
                    auth_provider='google',
                    google_sub=google_sub,
                    profile_image=profile_image
                )
                user.set_unusable_password() # They don't have a regular password
                user.save()

            # Generate JWT tokens
            tokens = get_tokens_for_user(user)
            user_data = UserSerializer(user).data
            
            return Response({
                "success": True,
                "message": "Authentication successful.",
                "data": {
                    "tokens": tokens,
                    "user": user_data
                }
            }, status=status.HTTP_200_OK)

        except ValueError as e:
            # Invalid token
            print(f"Google Auth Error: {str(e)}")
            return Response({"success": False, "message": f"Invalid Google Token. Error: {str(e)}"}, status=status.HTTP_401_UNAUTHORIZED)
            
    return Response({"success": False, "message": "Validation failed.", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
