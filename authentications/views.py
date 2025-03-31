from django.shortcuts import render
from .serializers import UserSerializer, LoginSerializer, LogoutSerializer
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import User
from rest_framework.permissions import IsAuthenticated
# from .utils import sendCodeToUser
import jwt, datetime
from django.conf import settings

class RegisterView(APIView):
    def post(self, request):
        user_data = request.data
        serializer = UserSerializer(data=user_data)
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            user = serializer.data
            return Response({
                'data': user,
                'message':f'Created account successfully!'
            }, status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


class LoginView(APIView):
    serializer_class = LoginSerializer
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UserView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        data = {
            'msg': 'successfully authenticated',
        }
        return Response(data, status=status.HTTP_200_OK)
    
class LogoutView(APIView):
    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        response = Response({"message": "Đăng xuất thành công."}, status=status.HTTP_204_NO_CONTENT)
        response.delete_cookie('jwt')
        response.delete_cookie('refresh_token')
        return response



