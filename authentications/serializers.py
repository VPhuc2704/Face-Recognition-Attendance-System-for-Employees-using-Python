from tokenize import TokenError
from django.conf import settings
import jwt
from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .models import BlacklistedToken
class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(max_length = 68, min_length = 6, write_only=True)
    password2 = serializers.CharField(max_length = 68, min_length = 6, write_only=True)

    class Meta:
        model = User
        fields = ('id', 'firstName', 'lastName', 'email', 'password', 'password2')

    def validate(self, attrs):
        password = attrs.get('password', "")
        password2 = attrs.get('password2', "")
        if password != password2:
            raise serializers.ValidationError("Password does not match!")
        return attrs
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email = validated_data['email'],
            firstName = validated_data.get('firstName'),
            lastName = validated_data.get('lastName'),
            password = validated_data.get('password')
        )   
        return user
    

class LoginSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(max_length=255,min_length=6)
    password = serializers.CharField(max_length=68, min_length=6, write_only=True)
    full_name = serializers.CharField(max_length=68, read_only=True)
    access_token = serializers.CharField(max_length=255, read_only=True)
    refresh_token = serializers.CharField(max_length=255, read_only=True)
    class Meta:
        model = User
        fields = ('email', 'password', 'full_name', 'access_token', 'refresh_token')
    def validate(self, attrs):
        email = attrs.get('email', '')
        password = attrs.get('password', '')
        request= self.context.get('request')
        user = authenticate(request, email=email, password=password)
        if not user:
            raise AuthenticationFailed('User not found!')
        user_tokens = user.tokens() 
        return {
            "email": user.email,
            "full_name": user.get_full_name(),
            "access_token":str(user_tokens.get('access')),
            "refresh_token": str(user_tokens.get('refresh'))
        }
    
class LogoutSerializer(serializers.Serializer):
    refresh_token = serializers.CharField()

    default_error_messages={
        'bad_token': ('Token không hợp lệ hoặc đã hết hạn')
    }

    def validate(self, attrs):
       self.token = attrs['refresh_token']
       return attrs
    def save(self, **kwargs):
        try:
            token = RefreshToken(self.token)
            if BlacklistedToken.objects.filter(token=str(token)).exists():
                raise serializers.ValidationError("Token đã bị liệt vào danh sách đen")
            token.blacklist()
            BlacklistedToken.objects.create(token=str(token))
        except TokenError:
            self.fail('bad_token')