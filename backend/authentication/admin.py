from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import OTP

User = get_user_model()

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'is_verified', 'auth_provider', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('is_verified', 'auth_provider', 'is_staff', 'is_superuser')

@admin.register(OTP)
class OTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'code', 'purpose', 'is_used', 'created_at', 'expires_at')
    search_fields = ('user__email', 'code')
    list_filter = ('purpose', 'is_used')
