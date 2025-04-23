from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAdminUser
# from rest_framework import viewsets
from attendance.models import Attendance
from employees.models import Employee
from attendance.serializers import AttendanceSerializer
from datetime import date, datetime

from rest_framework import viewsets
from authentications.models import User
from admins.serializers import AdminUserCreateSerializer
from rest_framework.exceptions import NotFound, PermissionDenied

class AdminUserViewSet(viewsets.ModelViewSet):
    # queryset = User.objects.all()
    # queryset = User.objects.exclude(role="admin")
    serializer_class = AdminUserCreateSerializer
    permission_classes = [IsAdminUser]
    def get_queryset(self):
        if self.action == 'destroy':
            return User.objects.all()
        return User.objects.exclude(role="admin")
    def check_admin_role(self, user):
        if user.role == 'admin':
            raise PermissionDenied("Không được phép sửa hoặc xóa tài khoản admin.")
    def get_object(self):
        # Lấy user theo ID từ URL
        user_id = self.kwargs.get('pk')
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            raise NotFound("User not found.")
        return user

    def update(self, request, *args, **kwargs):

        user = self.get_object()
        self.check_admin_role(user)
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        try:
            user = self.get_queryset().get(pk=pk)
            self.check_admin_role(user)
            user.delete()
            return Response(
                {"message": "Xoá người dùng thành công."}, status=status.HTTP_204_NO_CONTENT
            )
        except User.DoesNotExist:
            return Response(
                {"error": "Người dùng không tồn tại."}, status=status.HTTP_404_NOT_FOUND
            )
class AdminCreateAttendanceView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = request.data

        try:
            employee_id = data.get("employee_id")
            status_attendance = data.get("status")  # Lấy đúng giá trị admin gửi lên

            if not employee_id or not status_attendance:
                return Response(
                    {"error": "employee_id và status là bắt buộc"}, status=status.HTTP_400_BAD_REQUEST
                )

            employee = Employee.objects.get(id=employee_id)

            attendance = Attendance.objects.create(
                employeeId=employee,
                date=date.today(),  # Tự lấy ngày hôm nay
                check_in=datetime.now(),  # Gán giờ hiện tại
                status=status_attendance,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )

            serializer = AttendanceSerializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Employee.DoesNotExist:
            return Response(
                {"error": "Không tìm thấy nhân viên"}, status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_400_BAD_REQUEST
            )