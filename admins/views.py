from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from attendance.models import Attendance
from employees.models import Employee
from attendance.serializers import AttendanceSerializer
from datetime import date, datetime

class AdminCreateAttendanceView(APIView):
    permission_classes = [IsAdminUser]  # Chỉ admin mới được phép

    def post(self, request):
        data = request.data

        try:
            employee_id = data.get("employee_id")
            status_attendance = data.get("status")  # Lấy đúng giá trị admin gửi lên

            if not employee_id or not status_attendance:
                return Response({"error": "employee_id và status là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST)

            employee = Employee.objects.get(id=employee_id)

            attendance = Attendance.objects.create(
                employeeId=employee,
                date=date.today(),  # Tự lấy ngày hôm nay
                check_in=datetime.now(),  # Gán giờ hiện tại
                status=status_attendance,  # Không kiểm tra gì thêm
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Employee.DoesNotExist:
            return Response({"error": "Không tìm thấy nhân viên"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)