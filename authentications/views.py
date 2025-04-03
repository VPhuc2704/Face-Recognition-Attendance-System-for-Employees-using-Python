from tokenize import TokenError
from django.shortcuts import render
from .serializers import UserSerializer, LoginSerializer, LogoutSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User, BlacklistedToken
from rest_framework.permissions import IsAuthenticated

# from .utils import sendCodeToUser
import jwt, datetime
from django.conf import settings
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken


class RegisterView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        try:
            data = {
                "email": request.data["email"],
                "firstName": request.data["firstName"],
                "lastName": request.data["lastName"],
                "password": request.data["password"],
                "password2": request.data["password2"],
                "employee": {
                    "department": request.data["employee[department]"],
                    "position": request.data["employee[position]"],
                    "employeeImg": request.FILES["employee[employeeImg]"],
                },
            }
            # user_data = request.data
            # serializer = UserSerializer(data=user_data)
            serializer = UserSerializer(data=data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                user = serializer.data
                return Response(
                    {"data": user, "message": f"Created account successfully!"},
                    status=status.HTTP_201_CREATED,
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        except KeyError as e:
            return Response({"error": f"Thiếu trường bắt buộc: {str(e)}"}, status=400)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class LoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user  # Lấy thông tin người dùng từ request

        data = {
            "message": "Xác thực thành công",
            "user_info": {
                "id": user.id,
                "firstName": user.firstName,
                "lastName": user.lastName,
                "email": user.email,
                "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M:%S"),
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
                "role": user.role,
            },
            "is_authenticated": True,
        }
        return Response(data, status=status.HTTP_200_OK)


class LogoutView(APIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response(
            {"message": "Đăng xuất thành công."}, status=status.HTTP_204_NO_CONTENT
        )
        response.delete_cookie("jwt")
        response.delete_cookie("refresh_token")
        return response
