from django.urls import path
from .views import RegisterView, LoginView, UserView, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('register', RegisterView.as_view(), name="register"),
    path('login', LoginView.as_view(), name="login"),
    path('user', UserView.as_view()),
    path('logout', LogoutView.as_view(), name="logout"),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
]
