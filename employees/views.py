from django.shortcuts import render

from employees.models import Employee, Department, Position
from employees.serializers import EmployeeSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
# Create your views here.

class EmployeeProfileWiew(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            employee = Employee.objects.get(user=user)
            data = {
                "user": user.full_name(),
                "email": user.email,
                "gender": employee.gender,
                "date_of_birth": employee.date_of_birth,
                "phone": employee.phone,
                "address": employee.address,
                "department": {
                    "name": employee.department.name,
                    "manager": employee.department.manager.full_name() if employee.department.manager else None,
                },
                "position": {
                    "name": employee.position.name,
                },
                "employee_code": employee.employee_code,
                "start_date": employee.start_date,
                "status": employee.status,
                "employeeImg": employee.employeeImg.url if employee.employeeImg else None,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)
    

    def put(self, request):
        user = request.user
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({"error": "Employee not found"}, status=status.HTTP_404_NOT_FOUND)

        # Lấy data từ request
        data = request.data

        # Cập nhật thông tin employee
        employee.gender = data.get('gender', employee.gender)
        employee.date_of_birth = data.get('date_of_birth', employee.date_of_birth)
        employee.phone = data.get('phone', employee.phone)
        employee.address = data.get('address', employee.address)
        employee.employee_code = data.get('employee_code', employee.employee_code)
        employee.start_date = data.get('start_date', employee.start_date)
        employee.status = data.get('status', employee.status)

        # # Cập nhật department nếu được cung cấp
        # department_data = data.get('department', {})
        # if isinstance(department_data, dict):
        #     department_name = department_data.get('name')
        #     if department_name:
        #         department_obj, _ = Department.objects.get_or_create(name=department_name)
        #         data['department'] = department_obj.id

        # # Cập nhật position nếu được cung cấp
        # position_data = data.get('position', {})
        # if isinstance(position_data, dict):
        #     position_name = position_data.get('name')
        #     if position_name:
        #         position_obj, _ = Position.objects.get_or_create(name=position_name)
        #         data['position'] = position_obj.id

        # if request.FILES.get('employeeImg'):
        #     employee.employeeImg = request.FILES['employeeImg']

        employee.save()

        # Phản hồi dữ liệu mới
        return Response({
            "message": "Thông tin nhân viên đã được cập nhật thành công.",
            "employee": {
                "fullName": user.full_name(),
                "email": user.email,
                "gender": employee.gender,
                "date_of_birth": employee.date_of_birth,
                "phone": employee.phone,
                "address": employee.address,
                "department": {
                    "name": employee.department.name if employee.department else None,
                },
                "position": {
                    "name": employee.position.name if employee.position else None,
                },
                "employee_code": employee.employee_code,
                "start_date": employee.start_date,
                "status": employee.status,
                "employeeImg": employee.employeeImg.url if employee.employeeImg else None,
            }
        }, status=status.HTTP_200_OK)