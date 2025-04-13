from django.db import models
from django.utils.crypto import get_random_string

from authentications.models import User

class Department(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    manager = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='managed_department')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.name

class Position(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    def __str__(self):
        return self.name

class Employee(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    gender = models.CharField(max_length=10, choices=[('Nam', 'Nam'),('Nữ', 'Nữ'), ('Khác', 'Khác')], null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    phone = models.CharField(max_length=15, null=True, blank=True)
    address = models.CharField(max_length=255, null=True, blank=True)
    
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True)
    employee_code = models.CharField(max_length=20, unique=True, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=[('Active', 'Đang làm'), ('Inactive', 'Đã Nghỉ')], default='Active')

    employeeImg = models.ImageField(upload_to='employeeFace_img/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def full_name (self):
        return f"{self.user.firstName} {self.user.lastName}".strip()
    def save(self, *args, **kwargs):
        if not self.start_date:
            self.start_date = self.user.date_joined.date()
        if not self.employee_code:
            self.employee_code = 'EMP' + get_random_string(length=6, allowed_chars='0123456789')
        super().save(*args, **kwargs)

