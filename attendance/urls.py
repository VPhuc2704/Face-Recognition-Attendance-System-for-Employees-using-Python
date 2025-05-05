from django.urls import path
from .views import AttendanceHistoryView, AttendanceConfigView, ExportAttendanceExcel
from rest_framework_simplejwt.views import  TokenRefreshView

urlpatterns = [
    path('history', AttendanceHistoryView.as_view(), name='attendance_history'),
    path('config', AttendanceConfigView.as_view(), name='attendance_config'),
    path('export/excel', ExportAttendanceExcel.as_view(), name='attendance_export_excel'),
]
