from django.urls import path
from .views import AdminCreateAttendanceView
from rest_framework_simplejwt.views import  TokenRefreshView

urlpatterns = [
    path('createAttend', AdminCreateAttendanceView.as_view(), name='attendance_history'),
]
