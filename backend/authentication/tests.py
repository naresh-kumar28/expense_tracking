from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestClient
from unittest.mock import patch
from authentication.models import OTP
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APITestClient()
        self.signup_url = reverse('signup')
        self.verify_otp_url = reverse('verify_otp')
        self.login_url = reverse('login')
        self.forgot_password_url = reverse('forgot_password')
        self.reset_password_url = reverse('reset_password')
        
        self.user_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User",
            "phone_number": "1234567890",
            "password": "Password@123",
            "confirm_password": "Password@123"
        }

    @patch('authentication.utils.send_mail')
    def test_signup_success(self, mock_send_mail):
        """Test user signup and OTP creation"""
        response = self.client.post(self.signup_url, self.user_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email=self.user_data['email']).exists())
        self.assertTrue(OTP.objects.filter(user__email=self.user_data['email'], purpose='signup').exists())

    @patch('authentication.utils.send_mail')
    def test_verify_otp_success(self, mock_send_mail):
        """Test OTP verification flow"""
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(email=self.user_data['email'])
        otp = OTP.objects.get(user=user, purpose='signup')
        
        verify_data = {
            "email": user.email,
            "code": otp.code
        }
        response = self.client.post(self.verify_otp_url, verify_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        user.refresh_from_db()
        self.assertTrue(user.is_verified)
        self.assertTrue(user.is_active)

    @patch('authentication.utils.send_mail')
    def test_login_success(self, mock_send_mail):
        """Test login for verified user"""
        # Signup and verify
        self.client.post(self.signup_url, self.user_data)
        user = User.objects.get(email=self.user_data['email'])
        user.is_verified = True
        user.is_active = True
        user.save()
        
        login_data = {
            "email": self.user_data['email'],
            "password": self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', response.data['data'])

    def test_login_unverified_user(self):
        """Test that unverified user cannot login"""
        self.client.post(self.signup_url, self.user_data)
        login_data = {
            "email": self.user_data['email'],
            "password": self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('authentication.utils.send_mail')
    def test_forgot_password_and_reset(self, mock_send_mail):
        """Test forgot password OTP flow and password reset"""
        # Verify user first
        user = User.objects.create_user(email="reset@example.com", password="OldPassword@123")
        user.is_verified = True
        user.save()
        
        # Request forgot password
        self.client.post(self.forgot_password_url, {"email": user.email})
        otp = OTP.objects.get(user=user, purpose='reset_password')
        
        # Reset password
        reset_data = {
            "email": user.email,
            "code": otp.code,
            "password": "NewPassword@123",
            "confirm_password": "NewPassword@123"
        }
        response = self.client.post(self.reset_password_url, reset_data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check if login works with new password
        user.refresh_from_db()
        self.assertTrue(user.check_password("NewPassword@123"))

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_google_auth_new_user(self, mock_verify):
        """Test Google authentication for a new user"""
        mock_verify.return_value = {
            'email': 'google@example.com',
            'name': 'Google User',
            'sub': '123456789',
            'picture': 'http://image.com'
        }
        
        response = self.client.post(reverse('google_auth'), {"token": "fake-google-token"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='google@example.com')
        self.assertEqual(user.auth_provider, 'google')
        self.assertTrue(user.is_verified)

    @patch('authentication.views.id_token.verify_oauth2_token')
    def test_google_auth_existing_user_linking(self, mock_verify):
        """Test Google auth linking for existing email account"""
        User.objects.create_user(email='existing@example.com', password='Password123')
        
        mock_verify.return_value = {
            'email': 'existing@example.com',
            'name': 'Existing User',
            'sub': '987654321',
            'picture': 'http://image.com'
        }
        
        response = self.client.post(reverse('google_auth'), {"token": "fake-token"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user = User.objects.get(email='existing@example.com')
        self.assertEqual(user.auth_provider, 'google')
        self.assertEqual(user.google_sub, '987654321')
