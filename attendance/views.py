from datetime import date, time
from django.shortcuts import render
from django.utils.timezone import now 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import status

from attendance.models import Attendance, AttendanceConfig
from .serializers import AttendanceSerializer, AttendanceConfigSerializer


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
        if user.is_superuser:
            data = []
            for att in attendances:
                data.append({
                    "id": att.id,
                    "date": att.date,
                    "check_in": att.check_in,
                    "check_out": att.check_out,
                    "status": att.status,
                    "created_at": att.created_at,
                    "updated_at": att.updated_at,
                    "employee": {
                        "employee_code": att.employeeId.employee_code,
                        "employeeName": att.employeeId.full_name(),
                        "department": att.employeeId.department.name if att.employeeId.department else None,
                    }
                })
            return Response(data)
        else:
            return Response(serializer.data)
class AttendanceConfigView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        configTime = AttendanceConfig.objects.order_by("-created_at").first()
        if configTime:
            serializer = AttendanceConfigSerializer(configTime)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Chưa có cấu hình thời gian."})
    def post(self, request):
        serializer = AttendanceConfigSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status= status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request):
        configTime = AttendanceConfig.objects.order_by("-created_at").first()
        if not configTime:
            return Response({"message": "Chưa có cấu hình thời gian."}, status=status.HTTP_404_NOT_FOUND)
        serializer = AttendanceConfigSerializer(configTime, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)