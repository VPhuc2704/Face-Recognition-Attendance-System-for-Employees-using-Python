from django.db import models

from authentications.models import User

class Department(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Position(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255, unique=True)
    
    def __str__(self):
        return self.name

class Employee(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, blank=True)
    employeeImg = models.ImageField(upload_to='employeeFace_img/', null=True, blank=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


