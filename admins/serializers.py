from rest_framework import serializers

from authentications.models import User
from employees.models import Department, Employee, Position


class EmployeeNestedSerializer(serializers.ModelSerializer):
    department = serializers.CharField(source='department.name')
    position = serializers.CharField(source='position.name')

    class Meta:
        model = Employee
        fields = [
            'gender', 'date_of_birth', 'phone', 'address', 
            'employee_code', 'start_date', 'status', 'department', 'position', 'employeeImg'
        ]
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if data.get("employeeImg"):
            data['employeeImg'] = data['employeeImg'].replace('http://localhost:8000', '')
        return data

class AdminUserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    gender = serializers.CharField(write_only=True, required=False)
    date_of_birth = serializers.DateField(write_only=True, required = False)
    phone = serializers.CharField(write_only=True, required = False)
    address =serializers.CharField(write_only=True, required = False)
    
    department = serializers.CharField(write_only=True)
    position = serializers.CharField(write_only=True)
    employee_code = serializers.CharField(write_only=True,required = False)
    start_date = serializers.DateField(write_only=True, required = False)
    status = serializers.CharField(write_only=True, required = False)

    employeeImg = serializers.ImageField(write_only=True,required = False)
    employee = EmployeeNestedSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'firstName', 'lastName', 'email', 'password',
            'gender', 'date_of_birth', 'phone', 'address', 'employee_code', 
            'start_date', 'status', 'department', 'position', 'employeeImg', 'employee'
        ]
    def validate(self, data):
        email = data.get('email', None)
        if email:
            qs = User.objects.filter(email=email)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"email": "Email đã tồn tại."})
        return data



    def create(self, validated_data):
        password = validated_data.pop("password")

        if "status" not in validated_data or not validated_data.get("status"):
            validated_data["status"] = "Active"

        # Tạo user
        user = User.objects.create_user(
            email=validated_data.get('email'),
            firstName=validated_data.get('firstName'),
            lastName=validated_data.get('lastName'),
            password=password,
            role='staff'
        )
        department_name = validated_data.pop("department")
        position_name = validated_data.pop("position")

        department, _ = Department.objects.get_or_create(name=department_name)
        position, _ = Position.objects.get_or_create(name=position_name)

        Employee.objects.create(
            user=user,
            gender=validated_data.get('gender'),
            phone=validated_data.get('phone'),
            address=validated_data.get('address'),
            employee_code=validated_data.get('employee_code'),
            start_date=validated_data.get('start_date', None),
            status=validated_data.get('status'),
            department=department,
            position=position,
            employeeImg=validated_data.get('employeeImg', None)
        )
        return user
    def update(self, instance, validated_data):
        # Cập nhật thông tin User
        if 'employee_code' in validated_data:
            validated_data.pop('employee_code')
        instance.firstName = validated_data.get('firstName', instance.firstName)
        instance.lastName = validated_data.get('lastName', instance.lastName)
        if "email" in validated_data:
            instance.email = validated_data.get('email')
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        instance.save()
        department_name = validated_data.pop("department", None)
        position_name = validated_data.pop("position", None)
        department = None
        position = None
        if department_name:
            department, _ = Department.objects.get_or_create(name=department_name)
        if position_name:
            position, _ = Position.objects.get_or_create(name=position_name)
        if hasattr(instance, 'employee'):
            instance.employee.gender = validated_data.get('gender', instance.employee.gender)
            instance.employee.date_of_birth = validated_data.get('date_of_birth', instance.employee.date_of_birth)
            instance.employee.phone = validated_data.get('phone', instance.employee.phone)
            instance.employee.address = validated_data.get('address', instance.employee.address)
            instance.employee.start_date = validated_data.get('start_date', instance.employee.start_date)
            instance.employee.status = validated_data.get('status', instance.employee.status)
            instance.employee.employeeImg = validated_data.get('employeeImg', instance.employee.employeeImg)
            if department:
                instance.employee.department = department
            if position:
                instance.employee.position = position
            instance.employee.save()
        
        return instance