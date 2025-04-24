from datetime import date, time
from django.shortcuts import render
from django.utils.timezone import now 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from attendance.models import Attendance
from .serializers import AttendanceSerializer
from employees.models import Employee

class AttendanceHistoryView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        today = date.today()
        current_time = now().time() 
        if current_time >= time(10, 00):  # So sánh với 10:00 sáng
            all_employees = Employee.objects.all()
            for employee in all_employees:
                if not Attendance.objects.filter(employeeId=employee, date=today).exists():
                    Attendance.objects.create(
                        employeeId=employee,
                        date=today,
                        status="Absent",
                    )
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