from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Employee, Department, Position
from rest_framework.serializers import ModelSerializer as BaseUserSerializer

User = get_user_model()


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["name"]


class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ["name"]


class EmployeeSerializer(serializers.ModelSerializer):
    department = serializers.CharField(required=True)
    position = serializers.CharField(required=True)

    employeeImg = serializers.ImageField(required=True)

    class Meta:
        model = Employee
        fields = ("department", "position", "employeeImg")
        # field = "__all__"

    def validate(self, data):
        # Tự động tạo department/position nếu chưa có
        department_name = data.get("department")
        position_name = data.get("position")

        if not Department.objects.filter(name=department_name).exists():
            Department.objects.create(name=department_name)

        if not Position.objects.filter(name=position_name).exists():
            Position.objects.create(name=position_name)

        return data
