from django.urls import path
from .views import AttendanceHistoryView, AttendanceConfigView
from rest_framework_simplejwt.views import  TokenRefreshView

urlpatterns = [
    path('history', AttendanceHistoryView.as_view(), name='attendance_history'),
    path('config', AttendanceConfigView.as_view(), name='attendance_config'),
]
