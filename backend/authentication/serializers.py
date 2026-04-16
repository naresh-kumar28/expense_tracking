from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    """Serializer for user profile details"""
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'is_verified', 'auth_provider', 'profile_image')
        read_only_fields = ('id', 'email', 'is_verified', 'auth_provider')


class SignupSerializer(serializers.ModelSerializer):
    """Serializer for user signup"""
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'first_name', 'last_name', 'phone_number', 'password', 'confirm_password')

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(**validated_data)
        user.is_verified = False # Ensures user has to verify via OTP
        user.save()
        return user


class VerifyOTPSerializer(serializers.Serializer):
    """Serializer for verifying OTP"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)


class ResendOTPSerializer(serializers.Serializer):
    """Serializer for resending OTP"""
    email = serializers.EmailField(required=True)


class LoginSerializer(serializers.Serializer):
    """Serializer for basic email/password login"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer to trigger fake password reset OTP"""
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """Serializer to save new password using OTP"""
    email = serializers.EmailField(required=True)
    code = serializers.CharField(max_length=6, required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer to change password for an already authenticated user"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"new_password": "New password fields didn't match."})
        return attrs


class GoogleAuthSerializer(serializers.Serializer):
    """Serializer to handle Google Auth token from frontend"""
    token = serializers.CharField(required=True)
