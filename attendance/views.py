from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from attendance.models import Attendance
from .serializers import AttendanceSerializer

class AttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.is_authenticated:
            if user.is_superuser:
                attendances = Attendance.objects.all().order_by('-date')
            else:
                attendances = Attendance.objects.filter(employeeId=user.employee).order_by('-date')
        serializer = AttendanceSerializer(attendances, many=True)
        return Response(serializer.data)